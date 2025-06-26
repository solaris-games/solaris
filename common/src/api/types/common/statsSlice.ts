import {Statistics} from "./stats";

export type StatsSlice<ID> = {
    userId: ID,
    gameId: ID | undefined,
    closed: boolean,
    processed: boolean,
    stats: Statistics,
}