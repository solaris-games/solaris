import {object, string, Validator} from "solaris-common";
import {ColourOverrideRequest} from "solaris-common";

export const parseColourOverrideRequest: Validator<ColourOverrideRequest> = object({
    playerId: string,
    colour: object({
        alias: string,
        value: string
    })
});