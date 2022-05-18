import ValidationError from "../../errors/validation";
import { keyHasStringValue } from "./helpers";

export interface AuthLoginRequest {
    email: string;
    password: string;
};

export const mapToAuthLoginRequest = (body: any): AuthLoginRequest => {
    let errors: string[] = [];
    
    if (!keyHasStringValue(body, 'email')) {
        errors.push('Email is required.');
    }

    if (!keyHasStringValue(body, 'password')) {
        errors.push('Password is required.');
    }
    
    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        email: body.email,
        password: body.password
    }
};
