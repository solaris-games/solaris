import PaypalService from "../services/paypal";
import axios from "axios";
import { Config } from "../config/types/Config";
import { Payment } from "../services/types/Payment";

const config: Config = {
    paypal: {
        environment: "sandbox",
        clientId: "test ClientId",
        clientSecret: "test ClientSecret",
    },
} as Config;

type FakeArgs = {
    userId?: any;
    savedPayment?: any;
};

const createService = (fakeArgs: FakeArgs = {}) => {
    let savedPayment: any = null;

    const fakePaymentModel = function (data: any) {
        return {
            save: async () => {
                savedPayment = data;
            },
        };
    };

    const fakeConfig = { ...config };

    const fakePaymentRepo = {
        findOne: async (query: any) => fakeArgs.savedPayment ?? null,
    } as any;

    const fakeUserService = {
        incrementCreditsByPurchase: jasmine
            .createSpy("incrementCreditsByPurchase")
            .and.resolveTo(),
    } as any;

    const fakeCacheService = {
        get: (key: string) => null,
        put: (key: string, value: any, ttl: number) => {},
    } as any;

    const service = new PaypalService(
        fakePaymentModel,
        fakeConfig,
        fakePaymentRepo,
        fakeUserService,
        fakeCacheService,
    );

    return { service, savedPayment: () => savedPayment, fakeUserService };
};

const fakeAuthResponse = {
    status: 200,
    data: { access_token: "fakeAccessToken" },
};

const fakeCreateOrderResponse = {
    status: 201,
    data: {
        id: "ORDER123",
        links: [{ rel: "approve", href: "https://paypal.com/approve" }],
    },
};

const fakeCaptureResponse = (amount: string, status: string = "COMPLETED") => ({
    status: 201,
    data: {
        status,
        purchase_units: [
            {
                payments: {
                    captures: [
                        {
                            amount: { currency_code: "GBP", value: amount },
                        },
                    ],
                },
            },
        ],
    },
});

const stubAxios = (responses: { url: string; response: any }[]) => {
    const responsesByUrl = new Map<string, any>(
        responses.map((r) => [r.url, r.response]),
    );

    spyOn(axios, "post").and.callFake(((url: string) => {
        if (url === "https://api-m.sandbox.paypal.com/v1/oauth2/token") {
            return Promise.resolve(fakeAuthResponse);
        }

        if (responsesByUrl.has(url)) {
            return Promise.resolve(responsesByUrl.get(url));
        }

        fail(`Unexpected axios.post call: ${url}`);
    }) as any);
};

describe("PaypalService", () => {
    describe("authorizePayment", () => {
        it("should create a v2 order and return the approval url", async () => {
            const { service, savedPayment } = createService();

            const post = spyOn(axios, "post").and.returnValues(
                Promise.resolve(fakeAuthResponse) as any,
                Promise.resolve(fakeCreateOrderResponse) as any,
            );

            const approvalUrl = await service.authorizePayment(
                "userId" as any,
                10,
                9,
                0.9,
                "https://server/purchase/process",
                "https://client/#/shop",
            );

            expect(approvalUrl).toBe("https://paypal.com/approve");

            expect(post).toHaveBeenCalledWith(
                "https://api-m.sandbox.paypal.com/v2/checkout/orders",
                jasmine.objectContaining({
                    intent: "CAPTURE",
                }),
                jasmine.anything(),
            );

            expect(savedPayment()).toEqual(
                jasmine.objectContaining({
                    userId: "userId",
                    paymentId: "ORDER123",
                    totalCost: 9,
                    totalQuantity: 10,
                    unitCost: 0.9,
                }),
            );
        });

        it("should throw if order creation fails", async () => {
            const { service } = createService();

            stubAxios([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
                    response: { status: 500, data: {} },
                },
            ]);

            await expectAsync(
                service.authorizePayment(
                    "userId" as any,
                    10,
                    9,
                    0.9,
                    "https://server/purchase/process",
                    "https://client/#/shop",
                ),
            ).toBeRejectedWithError("Create order request failed");
        });
    });

    describe("processPayment", () => {
        const savedPayment: Partial<Payment> = {
            userId: "userId" as any,
            paymentId: "ORDER123",
            totalCost: 9,
            totalQuantity: 10,
            unitCost: 0.9,
        };

        it("should capture the order and credit the user", async () => {
            const { service, fakeUserService } = createService({
                savedPayment,
            });

            const post = spyOn(axios, "post").and.returnValues(
                Promise.resolve(fakeAuthResponse) as any,
                Promise.resolve(fakeCaptureResponse("9.00")) as any,
            );

            const result = await service.processPayment("ORDER123");

            expect(result).toEqual({ galacticTokens: 10 });

            expect(post).toHaveBeenCalledWith(
                "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                jasmine.anything(),
                jasmine.anything(),
            );

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).toHaveBeenCalledWith("userId", 10);
        });

        it("should throw if the payment is not found in the database", async () => {
            const { service, fakeUserService } = createService();

            stubAxios([]);

            await expectAsync(
                service.processPayment("ORDER123"),
            ).toBeRejectedWithError("Payment not found with id: ORDER123");

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });

        it("should throw if the capture request fails", async () => {
            const { service, fakeUserService } = createService({
                savedPayment,
            });

            stubAxios([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: { status: 500, data: {} },
                },
            ]);

            await expectAsync(
                service.processPayment("ORDER123"),
            ).toBeRejectedWithError("Capture order request failed: ORDER123");

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });

        it("should throw if the capture is not completed", async () => {
            const { service, fakeUserService } = createService({
                savedPayment,
            });

            stubAxios([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: fakeCaptureResponse("9.00", "DECLINED"),
                },
            ]);

            await expectAsync(
                service.processPayment("ORDER123"),
            ).toBeRejectedWithError(
                "Capture order not completed: ORDER123 (DECLINED)",
            );

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });

        it("should throw if the captured amount does not match the order", async () => {
            const { service, fakeUserService } = createService({
                savedPayment,
            });

            stubAxios([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: fakeCaptureResponse("1.00"),
                },
            ]);

            await expectAsync(
                service.processPayment("ORDER123"),
            ).toBeRejectedWithError(
                "Captured amount does not match order: ORDER123 (1)",
            );

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });
    });
});
