export class AppError extends Error {
    constructor(
        message,
        errorCode,
        statusCode = 400
    ) {
        super(message);

        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
}