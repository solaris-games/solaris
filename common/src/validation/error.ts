export class ValidationError extends Error {
    statusCode: number;

    constructor(err: string | string[], statusCode?: number) {
        super(err as any);

        this.statusCode = statusCode || 400;
    }
};
