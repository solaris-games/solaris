import ValidationError from "../../errors/validation";
import { DBObjectId } from "../../services/types/DBObjectId";
import { object, Validator, objectId } from "../validate";
import { keyHasBooleanValue, keyHasNumberValue, keyHasStringValue } from "./helpers";

export interface GameCreateGameRequest {
    // TODO
};

export interface GameJoinGameRequest {
    playerId: DBObjectId;
    alias: string;
    avatar: number;
    password: string;
};

export const mapToGameJoinGameRequest = (body: any): GameJoinGameRequest => {
    let errors: string[] = [];

    if (!keyHasStringValue(body, 'playerId')) {
        errors.push('Player ID is required.');
    }

    if (!keyHasStringValue(body, 'alias')) {
        errors.push('Alias is required.');
    }

    if (!keyHasNumberValue(body, 'avatar')) {
        errors.push('Avatar is required.');
    }

    // TODO: Password?

    if (errors.length) {
        throw new ValidationError(errors);
    }

    body.avatar = +body.avatar;
    
    return {
        playerId: body.playerId,
        alias: body.alias,
        avatar: body.avatar,
        password: body.password
    }
};

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
