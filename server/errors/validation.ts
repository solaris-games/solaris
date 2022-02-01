export default class ValidationError extends Error {
    statusCode: Number;

    constructor(err: string | string[], statusCode?: number) {
        super(err as any);

        this.statusCode = statusCode || 400;
    }
};
