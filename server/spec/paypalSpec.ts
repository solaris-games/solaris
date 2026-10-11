import PaypalService from "../services/paypal";
import axios from "axios";
import { Config } from "../config/types/Config";
import { Payment } from "../services/types/Payment";
import { ValidationError } from "@solaris/common";

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
    claimResult?: any;
};

const sessionUser = { toString: () => "userId" };
const otherUser = { toString: () => "someoneElse" };

const baseSavedPayment: Partial<Payment> = {
    _id: "payment1" as any,
    userId: sessionUser as any,
    paymentId: "ORDER123",
    totalCost: 9,
    totalQuantity: 10,
    unitCost: 0.9,
    processed: false,
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

    fakePaymentModel.findOneAndUpdate = jasmine
        .createSpy("findOneAndUpdate")
        .and.resolveTo(
            fakeArgs.claimResult !== undefined
                ? fakeArgs.claimResult
                : { ...baseSavedPayment, processed: true },
        );

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
        fakePaymentModel as any,
        fakeConfig,
        fakePaymentRepo,
        fakeUserService,
        fakeCacheService,
    );

    return {
        service,
        savedPayment: () => savedPayment,
        fakeUserService,
        claimSpy: fakePaymentModel.findOneAndUpdate,
    };
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

const fakeCaptureData = (amount: string, status: string = "COMPLETED") => ({
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
});

const fakeCaptureResponse = (amount: string, status: string = "COMPLETED") => ({
    status: 201,
    data: fakeCaptureData(amount, status),
});

const stubAxiosPost = (responses: { url: string; response: any }[]) => {
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

const stubAxiosGet = (responses: { url: string; response: any }[]) => {
    const responsesByUrl = new Map<string, any>(
        responses.map((r) => [r.url, r.response]),
    );

    spyOn(axios, "get").and.callFake(((url: string) => {
        if (responsesByUrl.has(url)) {
            return Promise.resolve(responsesByUrl.get(url));
        }

        fail(`Unexpected axios.get call: ${url}`);
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
                "https://client/#/shop/paymentreturn",
                "https://client/#/shop",
            );

            expect(approvalUrl).toBe("https://paypal.com/approve");

            expect(post).toHaveBeenCalledWith(
                "https://api-m.sandbox.paypal.com/v2/checkout/orders",
                jasmine.objectContaining({
                    intent: "CAPTURE",
                    purchase_units: [
                        jasmine.objectContaining({
                            amount: jasmine.objectContaining({
                                currency_code: "GBP",
                                value: "9.00",
                                breakdown: {
                                    item_total: {
                                        currency_code: "GBP",
                                        value: "9.00",
                                    },
                                },
                            }),
                        }),
                    ],
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

            stubAxiosPost([
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
                    "https://client/#/shop/paymentreturn",
                    "https://client/#/shop",
                ),
            ).toBeRejectedWithError("Create order request failed");
        });
    });

    describe("processPayment", () => {
        it("should capture the order and credit the user atomically", async () => {
            const { service, fakeUserService, claimSpy } = createService({
                savedPayment: baseSavedPayment,
            });

            const post = spyOn(axios, "post").and.returnValues(
                Promise.resolve(fakeAuthResponse) as any,
                Promise.resolve(fakeCaptureResponse("9.00")) as any,
            );

            const result = await service.processPayment(
                "ORDER123",
                sessionUser as any,
            );

            expect(result).toEqual({ galacticTokens: 10 });

            expect(post).toHaveBeenCalledWith(
                "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                jasmine.anything(),
                jasmine.anything(),
            );

            expect(claimSpy).toHaveBeenCalledWith(
                { _id: baseSavedPayment._id, processed: { $ne: true } },
                { $set: { processed: true } },
            );

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).toHaveBeenCalledWith(sessionUser, 10);
        });

        it("should look up the payment by order id and session user", async () => {
            const { service, fakeUserService } = createService({
                savedPayment: baseSavedPayment,
            });

            const repoSpy = spyOn(
                (service as any).paymentRepo,
                "findOne",
            ).and.callThrough();

            stubAxiosPost([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: fakeCaptureResponse("9.00"),
                },
            ]);

            await service.processPayment("ORDER123", sessionUser as any);

            expect(repoSpy).toHaveBeenCalledWith({
                paymentId: "ORDER123",
                userId: sessionUser,
            });
            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).toHaveBeenCalled();
        });

        it("should reject the request if the payment does not exist or belongs to another user", async () => {
            const { service, fakeUserService } = createService();

            stubAxiosPost([]);

            await expectAsync(
                service.processPayment("ORDER123", otherUser as any),
            ).toBeRejectedWithError(ValidationError);

            await expectAsync(
                service.processPayment("ORDER123", sessionUser as any),
            ).toBeRejectedWithError(ValidationError);

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });

        it("should return a success without capturing or crediting for an already processed payment", async () => {
            const { service, fakeUserService } = createService({
                savedPayment: { ...baseSavedPayment, processed: true },
            });

            stubAxiosPost([]);

            const result = await service.processPayment(
                "ORDER123",
                sessionUser as any,
            );

            expect(result).toEqual({ galacticTokens: 10 });
            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });

        it("should return a success without crediting when a concurrent request has consumed the payment", async () => {
            const { service, fakeUserService } = createService({
                savedPayment: baseSavedPayment,
                claimResult: null,
            });

            stubAxiosPost([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: fakeCaptureResponse("9.00"),
                },
            ]);

            const result = await service.processPayment(
                "ORDER123",
                sessionUser as any,
            );

            expect(result).toEqual({ galacticTokens: 10 });
            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });

        it("should recover a completed order when the capture request fails", async () => {
            const { service, fakeUserService, claimSpy } = createService({
                savedPayment: baseSavedPayment,
            });

            stubAxiosPost([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: Promise.reject(new Error("network error")),
                },
            ]);

            stubAxiosGet([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123",
                    response: {
                        status: 200,
                        data: fakeCaptureData("9.00"),
                    },
                },
            ]);

            const result = await service.processPayment(
                "ORDER123",
                sessionUser as any,
            );

            expect(result).toEqual({ galacticTokens: 10 });
            expect(claimSpy).toHaveBeenCalled();
            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).toHaveBeenCalledWith(sessionUser, 10);
        });

        it("should throw if the capture request fails and the order is not completed", async () => {
            const { service, fakeUserService } = createService({
                savedPayment: baseSavedPayment,
            });

            stubAxiosPost([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: Promise.reject(new Error("network error")),
                },
            ]);

            stubAxiosGet([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123",
                    response: {
                        status: 200,
                        data: fakeCaptureData("9.00", "DECLINED"),
                    },
                },
            ]);

            await expectAsync(
                service.processPayment("ORDER123", sessionUser as any),
            ).toBeRejectedWithError(
                "Capture order not completed: ORDER123 (DECLINED)",
            );

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });

        it("should throw if the captured amount does not match the order", async () => {
            const { service, fakeUserService } = createService({
                savedPayment: baseSavedPayment,
            });

            stubAxiosPost([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: fakeCaptureResponse("1.00"),
                },
            ]);

            await expectAsync(
                service.processPayment("ORDER123", sessionUser as any),
            ).toBeRejectedWithError(
                "Captured amount does not match order: ORDER123 (1)",
            );

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });

        it("should throw if the captured currency does not match the order", async () => {
            const { service, fakeUserService } = createService({
                savedPayment: baseSavedPayment,
            });

            stubAxiosPost([
                {
                    url: "https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER123/capture",
                    response: {
                        status: 201,
                        data: {
                            status: "COMPLETED",
                            purchase_units: [
                                {
                                    payments: {
                                        captures: [
                                            {
                                                amount: {
                                                    currency_code: "USD",
                                                    value: "9.00",
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                },
            ]);

            await expectAsync(
                service.processPayment("ORDER123", sessionUser as any),
            ).toBeRejectedWithError(
                "Captured currency does not match order: ORDER123 (USD)",
            );

            expect(
                fakeUserService.incrementCreditsByPurchase,
            ).not.toHaveBeenCalled();
        });
    });
});
