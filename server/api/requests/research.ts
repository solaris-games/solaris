import {
    MAX_RESEARCH_QUEUE_LENGTH,
    object,
    RESEARCH_TYPES,
    RESEARCH_TYPES_NOT_RANDOM,
    ResearchUpdateQueueRequest,
    ResearchUpdateNowRequest,
    sizedArray,
    stringEnumeration,
    Validator,
} from "@solaris/common";
import { ResearchType, ResearchTypeNotRandom } from "@solaris/common";

export const parseUpdateResearchNowRequest: Validator<ResearchUpdateNowRequest> =
    object({
        preference: stringEnumeration<
            ResearchTypeNotRandom,
            ResearchTypeNotRandom[]
        >(RESEARCH_TYPES_NOT_RANDOM),
    });

export const parseUpdateResearchQueueRequest: Validator<ResearchUpdateQueueRequest> =
    object({
        queue: sizedArray(
            0,
            MAX_RESEARCH_QUEUE_LENGTH,
            stringEnumeration<ResearchType, ResearchType[]>(RESEARCH_TYPES),
        ),
    });
