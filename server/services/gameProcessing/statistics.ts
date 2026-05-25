import {IStatisticsService} from "../types/IStatisticsService";
import {Game} from "../types/Game";
import {DBObjectId} from "../types/DBObjectId";
import { Statistics } from "@solaris/common";

type Modifications = {
    gameId: DBObjectId;
    playerId: DBObjectId;
    modif: (stats: Statistics) => void;
}

export class ProcessingStatisticsService implements IStatisticsService {
    private _closeGames: Game[] = [];
    private _modifications: Modifications[] = [];

    closeStatsSlicesForGame(game: Game): Promise<void> {
        this._closeGames.push(game);
        return Promise.resolve();
    }

    modifyStats(gameId: DBObjectId, playerId: DBObjectId, modif: (stats: Statistics) => void): Promise<void> {
        this._modifications.push({ gameId, playerId, modif });
        return Promise.resolve();
    }

    async process(statisticsService: IStatisticsService) {
        const closeGames = this._closeGames;
        this._closeGames = [];

        const modifcations = this._modifications;
        this._modifications = [];

        for (let closeGame of closeGames) {
            await statisticsService.closeStatsSlicesForGame(closeGame);
        }

        for (let modifcation of modifcations) {
            await statisticsService.modifyStats(modifcation.gameId, modifcation.playerId, modifcation.modif);
        }
    }
}