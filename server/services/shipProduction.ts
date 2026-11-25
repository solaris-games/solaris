import { ShipService } from "@solaris/common";
import { Game } from "./types/Game";
import { DBObjectId } from "./types/DBObjectId";

export class ShipProductionService {
    constructor(private shipService: ShipService<DBObjectId>) {}

    produceShips(game: Game) {
        const starsToProduce = game.galaxy.stars.filter(
            (s) => s.infrastructure.industry! > 0,
        );

        for (let i = 0; i < starsToProduce.length; i++) {
            let star = starsToProduce[i];

            if (star.ownedByPlayerId) {
                // Note: We recalculate the pop cap every time we produce ships so that it is always up to date.
                const cap = this.shipService.calculatePopulationCap(
                    game,
                    star.ownedByPlayerId!,
                );

                if (cap?.isPopulationCapped) {
                    continue;
                }

                const productionShips =
                    this.shipService.calculateStarShipProduction(
                        game,
                        star,
                        cap,
                    );

                // Increase the number of ships garrisoned by how many are manufactured this tick.
                star.shipsActual! += productionShips;
                star.ships = Math.floor(star.shipsActual!);
            }
        }
    }
}
