import { AppError } from '../errors/appError.js';

export class LoginDTO {
    email;
    password;

    constructor(data) {
        this.email = data.email;
        this.password = data.password;
        this.validate();
    }

    validate() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

        if (!this.email) {
            throw new AppError(
                'Email and password are required',
                'VALIDATION_ERROR',
                400
            );
        }

        if (!emailRegex.test(this.email)) {
            throw new AppError(
                'Invalid email format',
                'INVALID_EMAIL_FORMAT',
                400
            );
        }

        if (!this.password) {
            throw new AppError(
                'Email and password are required',
                'VALIDATION_ERROR',
                400
            );
        }
    }
}