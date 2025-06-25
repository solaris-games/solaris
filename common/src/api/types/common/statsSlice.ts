import {Statistics} from "./stats";

export type StatsSlice<ID> = {
    userId: ID,
    gameId: ID | undefined,
    processed: boolean,
    stats: Statistics,
}