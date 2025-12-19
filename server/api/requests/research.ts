import {
    object, RESEARCH_TYPES,
    RESEARCH_TYPES_NOT_RANDOM, ResearchUpdateNextRequest,
    ResearchUpdateNowRequest,
    stringEnumeration,
    Validator
} from "solaris-common";
import { ResearchType, ResearchTypeNotRandom } from "solaris-common";

export const parseUpdateResearchNowRequest: Validator<ResearchUpdateNowRequest> = object({
    preference: stringEnumeration<ResearchTypeNotRandom, ResearchTypeNotRandom[]>(RESEARCH_TYPES_NOT_RANDOM),
});

export const parseUpdateResearchNextRequest: Validator<ResearchUpdateNextRequest> = object({
    preference: stringEnumeration<ResearchType, ResearchType[]>(RESEARCH_TYPES),
});
