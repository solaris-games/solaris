import ValidationError from '../../errors/validation';

export default () => {
    return {
        handleError(err, req, res, next) {
            // If there is an error in the pipleline
            // then test to see what type of error it is. If its a validation
            // error then return it with its status code.
            if (err instanceof ValidationError) {
            // if (err instanceof ValidationError) {
                let errors: string | string[] = err.message;

                if (!Array.isArray(errors)) {
                    errors = [errors];
                }

                return res.status(err.statusCode).json({
                    errors
                });
            }

            console.error(err.stack);

            return res.status(500).json({
                errors: ['Something broke. If the problem persists, please contact a developer.']
            });
        }
    };
};
