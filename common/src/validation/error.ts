export class ValidationError extends Error {
    statusCode: number;

    constructor(err: string | string[], statusCode?: number) {
        super(err as any);

        this.statusCode = statusCode || 400;

        // necessary because JS is weird.

        Object.setPrototypeOf(this, ValidationError.prototype);

        this.name = "ValidationError";
    }
};
