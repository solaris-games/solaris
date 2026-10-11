import { DBObjectId } from "./types/DBObjectId";
import Repository from "./repository";
import { Payment } from "./types/Payment";
import CacheService from "./cache";
import UserService from "./user";
import { Config } from "../config/types/Config";
import axios, { AxiosRequestConfig } from "axios";

const CURRENCY = "GBP";
const CACHE_KEY_TOKEN = "paypalToken";

export default class PaypalService {
    PaymentModel: any;
    config: Config;
    paymentRepo: Repository<Payment>;
    userService: UserService;
    cacheService: CacheService;

    API = {
        sandbox: "https://api-m.sandbox.paypal.com",
        production: "https://api-m.paypal.com",
    };

    constructor(
        PaymentModel,
        config: Config,
        paymentRepo: Repository<Payment>,
        userService: UserService,
        cacheService: CacheService,
    ) {
        this.PaymentModel = PaymentModel;
        this.config = config;
        this.paymentRepo = paymentRepo;
        this.userService = userService;
        this.cacheService = cacheService;
    }

    async _getToken() {
        let cached = this.cacheService.get(CACHE_KEY_TOKEN);

        if (cached) {
            return cached;
        }

        const environment = this.config.paypal.environment;

        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");

        let authResponse = await axios.post(
            `${this.API[environment]}/v1/oauth2/token`,
            params,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                auth: {
                    username: this.config.paypal.clientId!,
                    password: this.config.paypal.clientSecret!,
                },
            },
        );

        let token = authResponse.data.access_token;

        this.cacheService.put(CACHE_KEY_TOKEN, token, 3000000); // 50 minutes

        return token;
    }

    async _http(url: string, config: AxiosRequestConfig = {}) {
        const token = await this._getToken();

        return axios.post(url, config.data ?? {}, {
            ...config,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...config.headers,
            },
        });
    }

    async authorizePayment(
        userId: DBObjectId,
        totalQuantity: number,
        totalCost: number,
        unitCost: number,
        returnUrl: string,
        cancelUrl: string,
    ) {
        const environment = this.config.paypal.environment;

        const order = await this._http(
            `${this.API[environment]}/v2/checkout/orders`,
            {
                data: {
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            description: `${totalQuantity} Galactic Tokens on Solaris`,
                            amount: {
                                currency_code: CURRENCY,
                                value: totalCost.toFixed(2),
                            },
                            items: [
                                {
                                    name: "Galactic Tokens",
                                    quantity: totalQuantity.toString(),
                                    unit_amount: {
                                        currency_code: CURRENCY,
                                        value: unitCost.toFixed(2),
                                    },
                                },
                            ],
                        },
                    ],
                    application_context: {
                        return_url: returnUrl,
                        cancel_url: cancelUrl,
                    },
                },
            },
        );

        if (order.status !== 201) {
            throw new Error(`Create order request failed`);
        }

        const payment = new this.PaymentModel({
            userId,
            paymentId: order.data.id,
            totalCost,
            totalQuantity,
            unitCost,
        });

        await payment.save();

        const approvalUrl = order.data.links.find(
            (l) => l.rel === "approve" || l.rel === "payer-action",
        ).href;

        return approvalUrl;
    }

    async processPayment(orderId: string) {
        const environment = this.config.paypal.environment;

        const payment = await this.paymentRepo.findOne({
            paymentId: orderId,
        });

        if (!payment) {
            throw new Error(`Payment not found with id: ${orderId}`);
        }

        const capture = await this._http(
            `${this.API[environment]}/v2/checkout/orders/${orderId}/capture`,
        );

        if (capture.status !== 201) {
            throw new Error(`Capture order request failed: ${orderId}`);
        }

        if (capture.data.status !== "COMPLETED") {
            throw new Error(
                `Capture order not completed: ${orderId} (${capture.data.status})`,
            );
        }

        const capturedAmount = parseFloat(
            capture.data.purchase_units?.[0]?.payments?.captures?.[0]?.amount
                ?.value,
        );

        if (
            !Number.isFinite(capturedAmount) ||
            capturedAmount.toFixed(2) !== payment.totalCost.toFixed(2)
        ) {
            throw new Error(
                `Captured amount does not match order: ${orderId} (${capturedAmount})`,
            );
        }

        await this.userService.incrementCreditsByPurchase(
            payment.userId,
            payment.totalQuantity,
        );

        return {
            galacticTokens: payment.totalQuantity,
        };
    }
}
