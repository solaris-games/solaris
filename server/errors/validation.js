module.exports = class ValidationError extends Error {
    constructor(errs) {
        super(errs);
    }
};
