import { DBObjectId } from "./types/DBObjectId";
import Repository from "./repository";
import { Payment } from "./types/Payment";
import CacheService from "./cache";
import UserService from "./user";
import { Config } from "../config/types/Config";
import axios from 'axios';

const CURRENCY = 'GBP';
const CACHE_KEY_TOKEN = 'paypalToken';

export default class PaypalService {
    PaymentModel: any;
    config: Config;
    paymentRepo: Repository<Payment>;
    userService: UserService;
    cacheService: CacheService;

    API = {
        sandbox: {
            auth: 'https://api-m.sandbox.paypal.com/v1/oauth2/token',
            payment: 'https://api-m.sandbox.paypal.com/v1/payments/payment',
            execute: (paymentId: string) => `https://api-m.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`,
            capture: (authorizationId: string) => `https://api-m.sandbox.paypal.com/v1/payments/authorization/${authorizationId}/capture`
        },
        production: {
            auth: 'https://api-m.paypal.com/v1/oauth2/token',
            payment: 'https://api-m.paypal.com/v1/payments/payment',
            execute: (paymentId: string) => `https://api-m.paypal.com/v1/payments/payment/${paymentId}/execute`,
            capture: (authorizationId: string) => `https://api-m.paypal.com/v1/payments/authorization/${authorizationId}/capture`
        }
    };

    constructor (
        PaymentModel,
        config: Config,
        paymentRepo: Repository<Payment>,
        userService: UserService,
        cacheService: CacheService
    ) {
        this.PaymentModel= PaymentModel;
        this.config = config;
        this.paymentRepo = paymentRepo;
        this.userService = userService;
        this.cacheService = cacheService;
    }

    async authorize() {
        let cached = this.cacheService.get(CACHE_KEY_TOKEN);

        if (cached) {
            return cached;
        }

        const environment = this.config.paypal.environment;

        const params = new URLSearchParams()
        params.append('grant_type', 'client_credentials')

        let authResponse = await axios.post(this.API[environment].auth, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            auth: {
                username: this.config.paypal.clientId!,
                password: this.config.paypal.clientSecret!
            }
        });

        let token = authResponse.data.access_token;

        this.cacheService.put(CACHE_KEY_TOKEN, token, 3600000); // 1 hour

        return token;
    }

    async authorizePayment(userId: DBObjectId, totalQuantity: number, totalCost: number, unitCost: number, returnUrl: string, cancelUrl: string) {
        const environment = this.config.paypal.environment;

        // Get a token from PayPal
        let token = await this.authorize();
        const requestOptions = {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };

        // Authorize a payment
        let paymentResponse = await axios.post(this.API[environment].payment, {
            intent: 'authorize',
            payer: {
                payment_method: "paypal"
            },
            transactions: [
                {
                    amount: {
                        total: totalCost.toFixed(2),
                        currency: CURRENCY
                    },
                    description: `${totalQuantity} Galactic Tokens on Solaris`,
                    item_list: {
                        items: [
                            {
                                name: "Galactic Tokens",
                                quantity: totalQuantity,
                                price: unitCost.toFixed(2),
                                currency: CURRENCY
                            }
                        ]
                    }
                }
            ],
            note_to_payer: "Contact us for any questions on your order.",
            redirect_urls: {
                return_url: returnUrl,
                cancel_url: cancelUrl
            }
        }, requestOptions);

        // Create a payment in the database against the user so it can be retrieved later when processing the payment.
        let payment = new this.PaymentModel({
            userId,
            paymentId: paymentResponse.data.id,
            totalCost,
            totalQuantity,
            unitCost
        });

        await payment.save();

        // Redirect the user to the authorize URL
        let approvalUrl = paymentResponse.data.links.find((l) => l.rel === 'approval_url').href;

        return approvalUrl;
    }

    async processPayment(paymentId: string, payerId: string) {
        const environment = this.config.paypal.environment;
        
        // Get the payment from the DB to verify transaction.
        const payment = await this.paymentRepo.findOne({
            paymentId
        });

        if (!payment) {
            throw new Error(`Payment not found with id: ${paymentId}`);
        }

        // Get a token from PayPal
        let token = await this.authorize();
        const requestOptions = {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        };

        // Execute the approved payment
        let executeResponse = await axios.post(this.API[environment].execute(paymentId), {
            payer_id: payerId
        }, requestOptions);

        if (executeResponse.status !== 200) {
            throw new Error(`Execute payment request failed: ${paymentId}`);
        }

        for (let transaction of executeResponse.data.transactions) {
            const authorizationId = transaction.related_resources.find((r) => r.authorization != null).authorization.id;

            // Capture the payment.
            const authResponse = await axios.post(this.API[environment].capture(authorizationId), {
                amount: {
                    total: parseFloat(transaction.amount.total).toFixed(2),
                    currency: transaction.amount.currency
                }
            }, requestOptions);

            if (authResponse.status !== 201) {
                throw new Error(`Authorize payment request failed: ${authorizationId}`);
            }
        }

        // Add credits to the users account.
        await this.userService.incrementCreditsByPurchase(payment.userId, payment.totalQuantity);

        return {
            galacticTokens: payment.totalQuantity
        };
    }

};
