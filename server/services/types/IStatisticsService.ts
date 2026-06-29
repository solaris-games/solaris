import { Statistics, StatsSlice } from "@solaris/common";
import { DBObjectId } from "./DBObjectId";
import { Game } from "./Game";

export interface IStatisticsService {
    modifyStats(
        gameId: DBObjectId,
        playerId: DBObjectId,
        modif: (stats: Statistics) => void,
    ): Promise<void>;
    closeStatsSlicesForGame(game: Game): Promise<void>;
}
