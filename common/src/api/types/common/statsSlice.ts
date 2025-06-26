import {Statistics} from "./stats";

export type StatsSlice<ID> = {
    playerId: ID,
    gameId: ID,
    closed: boolean,
    processed: boolean,
    stats: Statistics,
}