import { object, string, Validator } from "@solaris/common";

export interface ProcessPaymentRequest {
    token: string;
}

export const parseProcessPaymentRequest: Validator<ProcessPaymentRequest> =
    object({
        token: string,
    });
