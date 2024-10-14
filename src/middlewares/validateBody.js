import createHttpError from 'http-errors';


export const validateBody = (schema) => async (req, res, next) => {
    try {
        console.log(req.body);
        console.log(1);
        await schema.validateAsync(req.body, {abortEarly: false,});
        next();
        } catch (error) {
            const validationError = createHttpError(400, 'Bad Request', {errors: error.details,});
            next(validationError);
        }
};
