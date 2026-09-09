import { DependencyContainer } from "../../services/types/DependencyContainer";
import { logger } from "../../utils/logging";
import { Game } from "../../services/types/Game";
import {
    TIMEOUT_FEATURED_DAYS,
    TIMEOUT_NORMAL_DAYS,
} from "../../services/gameList";
import { DateTime } from "luxon";

const log = logger("Cleanup Games Timed Out Job");

export const cleanupGamesTimedOutJob =
    (container: DependencyContainer) => async () => {
        const isTimedOut = (g: Game) => {
            const days = container.gameTypeService.isFeaturedGame(g)
                ? TIMEOUT_FEATURED_DAYS
                : TIMEOUT_NORMAL_DAYS;
            const date = DateTime.utc().minus({ days });

            return DateTime.fromJSDate(g._id.getTimestamp()) <= date;
        };

        try {
            const games =
                await container.gameListService.listGamesWaitingForPlayers();

            for (let i = 0; i < games.length; i++) {
                const game = games[i];

                if (isTimedOut(game)) {
                    continue;
                }

                try {
                    await container.gameService.delete(
                        game,
                        undefined,
                        container.eventService,
                    );
                } catch (e) {
                    log.error(e);
                }
            }
        } catch (e) {
            log.error(e, "CleanupGamesTimedOut job threw unhandled: " + e);
        }
    };
