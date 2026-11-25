import type { SpecialistValueService } from "./specialistValue";
import type { Game } from "../types/common/game";
import type { Player } from "../types/common/player";
import type { PlayerStatistics } from "../types/common/leaderboard";
import type { Star } from "../types/common/star";
import type { Carrier } from "../types/common/carrier";
import { ShipService } from "./ship";
import type { Id } from "../types/id";

interface IStarService<ID> {
    listStarsOwnedByPlayer(stars: Star<ID>[], playerId: ID): Star<ID>[];
}

interface ICarrierService<ID> {
    listCarriersOwnedByPlayer(
        carriers: Carrier<ID>[],
        playerId: ID,
    ): Carrier<ID>[];
}

export class PlayerStatisticsService<ID extends Id> {
    constructor(
        private starService: IStarService<ID>,
        private carrierService: ICarrierService<ID>,
        private specialistValueService: SpecialistValueService,
        private shipService: ShipService<ID>,
    ) {}

    getStats(game: Game<ID>, player: Player<ID>): PlayerStatistics {
        const playerStars = this.starService.listStarsOwnedByPlayer(
            game.galaxy.stars,
            player._id,
        );
        const playerCarriers = this.carrierService.listCarriersOwnedByPlayer(
            game.galaxy.carriers,
            player._id,
        );

        const totalStarSpecialists =
            this.calculateTotalStarSpecialists(playerStars);
        const totalCarrierSpecialists =
            this.calculateTotalCarrierSpecialists(playerCarriers);

        const totalStars = playerStars.length;
        const totalHomeStars = this.calculateTotalHomeStars(playerStars);

        return {
            totalStars: totalStars,
            totalHomeStars: totalHomeStars,
            totalCarriers: playerCarriers.length,
            totalShips: this.shipService.calculateTotalShips(
                playerStars,
                playerCarriers,
            ),
            totalShipsMax:
                this.shipService.calculatePopulationCap(game, player._id)
                    ?.shipsMaximum || null,
            totalEconomy: this.calculateTotalEconomy(playerStars),
            totalIndustry: this.calculateTotalIndustry(playerStars),
            totalScience: this.calculateTotalScience(game, playerStars),
            newShips: this.calculateTotalManufacturing(game, playerStars),
            warpgates: this.calculateWarpgates(playerStars),
            totalStarSpecialists,
            totalCarrierSpecialists,
            totalSpecialists: totalStarSpecialists + totalCarrierSpecialists,
        };
    }

    calculateTotalStars(player: Player<ID>, stars: Star<ID>[]) {
        const playerStars = this.starService.listStarsOwnedByPlayer(
            stars,
            player._id,
        );

        return playerStars.length;
    }

    calculateTotalHomeStars(playerStars: Star<ID>[]) {
        return playerStars.filter((s) => s.homeStar).length;
    }

    calculateTotalEconomy(playerStars: Star<ID>[]) {
        return playerStars.reduce((sum, s) => {
            const multiplier =
                this.specialistValueService.getEconomyInfrastructureMultiplier(
                    s,
                );
            const eco = s.infrastructure?.economy ?? 0;

            return sum + eco * multiplier;
        }, 0);
    }

    calculateTotalIndustry(playerStars: Star<ID>[]) {
        return playerStars.reduce((sum, s) => {
            const ind = s.infrastructure?.industry ?? 0;

            return sum + ind;
        }, 0);
    }

    calculateTotalScience(game: Game<ID>, playerStars: Star<ID>[]) {
        return playerStars.reduce((sum, s) => {
            const specialistMultiplier =
                this.specialistValueService.getScienceInfrastructureMultiplier(
                    s,
                );
            const sci = s.infrastructure?.science ?? 0;

            return (
                sum +
                Math.floor(
                    sci *
                        specialistMultiplier *
                        game.constants.research.sciencePointMultiplier,
                )
            );
        }, 0);
    }

    calculateTotalManufacturing(game: Game<ID>, playerStars: Star<ID>[]) {
        // Calculate the manufacturing level for all of the stars the player owns.
        const totalManufacturing = playerStars.reduce((sum, s) => {
            return sum + this.shipService.calculateStarManufacturing(game, s);
        }, 0);

        return Math.round((totalManufacturing + Number.EPSILON) * 100) / 100;
    }

    calculateWarpgates(playerStars: Star<ID>[]) {
        return playerStars.reduce((sum, s) => (s.warpGate ? sum + 1 : sum), 0);
    }

    calculateTotalCarriers(player: Player<ID>, carriers: Carrier<ID>[]) {
        const playerCarriers = this.carrierService.listCarriersOwnedByPlayer(
            carriers,
            player._id,
        );

        return playerCarriers.length;
    }

    calculateTotalStarSpecialists(playerStars: Star<ID>[]) {
        return playerStars.filter((s) => s.specialistId).length;
    }

    calculateTotalCarrierSpecialists(playerCarriers: Carrier<ID>[]) {
        return playerCarriers.filter((c) => c.specialistId).length;
    }
}
