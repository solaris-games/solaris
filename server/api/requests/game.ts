import ValidationError from "../../errors/validation";
import { DBObjectId } from "../../services/types/DBObjectId";
import {
    object,
    Validator,
    objectId,
    stringValue,
    number,
    string,
    or,
    just,
    UNICODE_INVISIBLE_CHARACTERS,
    UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE
} from "../validate";
import { keyHasBooleanValue, keyHasNumberValue, keyHasStringValue } from "./helpers";

export interface GameCreateGameRequest {
    // TODO
};

export interface GameJoinGameRequest {
    playerId: DBObjectId;
    alias: string;
    avatar: number;
    password: string | undefined;
};

export const parseGameJoinGameRequest: Validator<GameJoinGameRequest> = object({
    playerId: objectId,
    alias: stringValue({
        trim: true,
        minLength: 1,
        maxLength: 24,
        matches: UNICODE_PRINTABLE_CHARACTERS_WITH_WHITESPACE,
        ignoreForLengthCheck: UNICODE_INVISIBLE_CHARACTERS,
    }),
    avatar: number,
    password: or(string, just(undefined)),
});

export interface GameSaveNotesRequest {
    notes: string;
};

export const mapToGameSaveNotesRequest = (body: any): GameSaveNotesRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'notes', 0, 2000)) {
        errors.push('Notes is required and must not be greater than 2000 characters.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        notes: body.notes
    }
};

export interface GameConcedeDefeatRequest {
    openSlot: boolean;
}

export const mapToGameConcedeDefeatRequest = (body: any): GameConcedeDefeatRequest => {
    let errors: string[] = [];

    if (!keyHasBooleanValue(body, 'openSlot')) {
        errors.push('Open Slot is required.');
    }

    if (errors.length) {
        throw new ValidationError(errors);
    }

    return {
        openSlot: body.openSlot
    }
}

export type KickPlayerRequest = {
    playerId: DBObjectId,
}

export const parseKickPlayerRequest: Validator<KickPlayerRequest> = object({
    playerId: objectId
});
