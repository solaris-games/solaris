import ValidationError from "../../errors/validation";
import { keyHasStringValue } from "./helpers";

export interface BadgesPurchaseBadgeRequest {
    badgeKey: string;
};

export const mapToBadgesPurchaseBadgeRequest = (body: any): BadgesPurchaseBadgeRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'badgeKey')) {
        errors.push('Badge Key is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        badgeKey: body.badgeKey
    }
};
