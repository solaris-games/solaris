export default class ValidationError extends Error {
    statusCode: Number;

    constructor(errs, statusCode) {
        super(errs);

        this.statusCode = statusCode || 400;
    }
};
