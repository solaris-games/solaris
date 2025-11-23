import {Game} from "./types/Game";
import {Player} from "./types/Player";
import {GameHistory} from "./types/GameHistory";

export default class GameMaskingService {
    maskStars(game: Game, userPlayer: Player | null, history: GameHistory, isHistorical: boolean) {
        // Apply previous tick's data to all STARS the player does not own.
        // If historical mode, then its all star data in the requested tick.
        // If not historical mode, then replace non-player owned star data.
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            const gameStar = game.galaxy.stars[i];

            if (!isHistorical && userPlayer && gameStar.ownedByPlayerId && gameStar.ownedByPlayerId.toString() === userPlayer._id.toString()) {
                continue;
            }

            const historyStar = history.stars.find(x => x.starId.toString() === gameStar._id.toString());

            if (historyStar) {
                // If the player has abandoned the star in the current tick, then display that representation of the star
                // instead of the historical version.
                if (!isHistorical && userPlayer && historyStar.ownedByPlayerId && gameStar.ownedByPlayerId == null && historyStar.ownedByPlayerId.toString() === userPlayer._id.toString()) {
                    continue;
                }

                gameStar.ownedByPlayerId = historyStar.ownedByPlayerId;
                gameStar.naturalResources = historyStar.naturalResources;
                gameStar.ships = historyStar.ships;
                gameStar.shipsActual = historyStar.shipsActual;
                gameStar.specialistId = historyStar.specialistId;
                gameStar.homeStar = historyStar.homeStar;
                gameStar.warpGate = historyStar.warpGate;
                gameStar.ignoreBulkUpgrade = historyStar.ignoreBulkUpgrade;
                gameStar.infrastructure = historyStar.infrastructure;
                gameStar.location = historyStar.location == null || (historyStar.location.x == null || historyStar.location.y == null) ? gameStar.location : historyStar.location; // TODO: May not have history for the star (BR Mode). Can delete this in a few months after the history is cleaned.
                gameStar.wormHoleToStarId = historyStar.wormHoleToStarId;
            }
        }
    }
}