import type {Statistics} from "./stats";

export type StatsSlice<ID> = {
    _id: ID,
    playerId: ID,
    gameId: ID,
    closed: boolean,
    processed: boolean,
    stats: Statistics,
}