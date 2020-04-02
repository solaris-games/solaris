module.exports = class ValidationError extends Error {
    constructor(errs, statusCode) {
        super(errs);

        this.statusCode = statusCode || 400;
    }
};
