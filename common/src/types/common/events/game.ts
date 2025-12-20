import type {GameRankingResult} from "../rating";
import type {DiplomaticStatus} from "../diplomacy";

export interface BaseGameEvent<ID> {
    _id: ID;
    gameId: ID;
    tick: number;
    type: string;
    read: boolean;
    date?: Date;
}

export interface GamePlayerJoinedEvent<ID> extends BaseGameEvent<ID> {
    type: 'gamePlayerJoined',
    data: {
        playerId: ID,
        alias: string,
    },
}

export interface GamePlayerQuitEvent<ID> extends BaseGameEvent<ID> {
    type: 'gamePlayerQuit',
    data: {
        playerId: ID,
        alias: string,
    },
}

export interface GamePlayerDefeatedEvent<ID> extends BaseGameEvent<ID> {
    type: 'gamePlayerDefeated',
    data: {
        playerId: ID,
        alias: string,
        openSlot: boolean,
    },
}

export interface GamePlayerAfkEvent<ID> extends BaseGameEvent<ID> {
    type: 'gamePlayerAFK',
    data: {
        playerId: ID,
        alias: string,
    },
}

export interface GameStartedEvent<ID> extends BaseGameEvent<ID> {
    type: 'gameStarted',
    data: {},
}

export interface GameEndedEvent<ID> extends BaseGameEvent<ID> {
    type: 'gameEnded',
    data: {
        rankingResult: GameRankingResult<ID> | null,
    }
}

export interface GameDiplomacyPeaceDeclared<ID> extends BaseGameEvent<ID> {
    type: 'gameDiplomacyPeaceDeclared',
    data: DiplomaticStatus<ID>,
}

export interface GameDiplomacyWarDeclared<ID> extends BaseGameEvent<ID> {
    type: 'gameDiplomacyWarDeclared',
    data: DiplomaticStatus<ID>,
}
