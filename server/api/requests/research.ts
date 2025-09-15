import { ValidationError } from "solaris-common";
import { ResearchType, ResearchTypeNotRandom } from "../../services/types/Player";
import { keyHasStringValue } from "./helpers";

export interface ResearchUpdateNowRequest {
    preference: ResearchTypeNotRandom;
};

export const mapToResearchUpdateNowRequest = (body: any): ResearchUpdateNowRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'preference')) {
        errors.push('Preference is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    let preference = body.preference.toLowerCase().trim() as ResearchTypeNotRandom;

    return {
        preference
    }
};

export interface ResearchUpdateNextRequest {
    preference: ResearchType;
};

export const mapToResearchUpdateNextRequest = (body: any): ResearchUpdateNextRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'preference')) {
        errors.push('Preference is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }
    
    let preference = body.preference.toLowerCase().trim() as ResearchType;

    return {
        preference
    }
};
