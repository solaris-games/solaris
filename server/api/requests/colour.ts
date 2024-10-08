import {object, string, Validator} from "../validate";

export type ColourOverrideRequest = {
    playerId: string;
    colour: {
        alias: string;
        value: string;
    }
}

export const parseColourOverrideRequest: Validator<ColourOverrideRequest> = object({
    playerId: string,
    colour: object({
        alias: string,
        value: string
    })
});