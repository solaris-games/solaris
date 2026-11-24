import type { TechnologyService } from "./technology";
import type { Game } from "../types/common/game";
import type { Star } from "../types/common/star";
import type { Carrier } from "../types/common/carrier";
import type { Id } from "../types/id";

export interface IPlayerPopulationCap {
    shipsCurrent: number;
    shipsMaximum: number;
    difference: number;
    isPopulationCapped: boolean;
}

interface IStarService<ID> {
    listStarsOwnedByPlayer(stars: Star<ID>[], playerId: ID): Star<ID>[];
}

interface ICarrierService<ID> {
    listCarriersOwnedByPlayer(
        carriers: Carrier<ID>[],
        playerId: ID,
    ): Carrier<ID>[];
}

export class ShipService<ID extends Id> {
    constructor(
        private starService: IStarService<ID>,
        private technologyService: TechnologyService,
        private carrierService: ICarrierService<ID>,
    ) {}

    isPopulationRestricted(game: Game<ID>) {
        return game.settings.player.populationCap.enabled === "enabled";
    }

    calculateTotalShips(ownedStars: Star<ID>[], ownedCarriers: Carrier<ID>[]) {
        return (
            ownedStars
                .filter((s) => s.ships != null)
                .reduce((sum, s) => sum + s.ships!, 0) +
            ownedCarriers
                .filter((c) => c.ships != null)
                .reduce((sum, c) => sum + c.ships!, 0)
        );
    }

    calculatePopulationCap(
        game: Game<ID>,
        playerId: ID,
    ): IPlayerPopulationCap | null {
        if (!this.isPopulationRestricted(game)) {
            return null;
        }

        const playerStars = this.starService.listStarsOwnedByPlayer(
            game.galaxy.stars,
            playerId,
        );
        const playerCarriers = this.carrierService.listCarriersOwnedByPlayer(
            game.galaxy.carriers,
            playerId,
        );

        const shipsCurrent = this.calculateTotalShips(
            playerStars,
            playerCarriers,
        );
        const shipsMaximum =
            game.settings.player.populationCap.shipsPerStar * 3 +
            playerStars.length *
                game.settings.player.populationCap.shipsPerStar;
        const difference = shipsMaximum - shipsCurrent;
        const isPopulationCapped = shipsCurrent >= shipsMaximum;

        return {
            shipsCurrent,
            shipsMaximum,
            difference,
            isPopulationCapped,
        };
    }

    calculateStarShipProduction(
        game: Game<ID>,
        star: Star<ID>,
        populationCap: IPlayerPopulationCap | null,
    ) {
        const starEffectiveTechs =
            this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        // If there is a population cap then we need to determine how many ships are allowed to be built at this star so we don't exceed pop cap
        const maximumShipsAllowed = populationCap
            ? Math.max(populationCap.difference, 0)
            : null;

        let productionShips = this.calculateStarShipsByTicks(
            starEffectiveTechs.manufacturing,
            star.infrastructure.industry!,
            1,
            game.settings.galaxy.productionTicks,
        );

        if (maximumShipsAllowed) {
            productionShips = Math.min(productionShips, maximumShipsAllowed);
        }

        return productionShips;
    }

    calculateStarShipsByTicks(
        techLevel: number,
        industryLevel: number,
        ticks: number = 1,
        productionTicks: number = 24,
    ) {
        // A star produces Y*(X+5) ships every 24 ticks where X is your manufacturing tech level and Y is the amount of industry at a star.
        return +(
            ((industryLevel * (techLevel + 5)) / productionTicks) *
            ticks
        ).toFixed(2);
    }

    calculateManufacturingForIndustry(
        game: Game<ID>,
        star: Star<ID>,
        industry: number,
    ) {
        const effectiveTechs =
            this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        return this.calculateStarShipsByTicks(
            effectiveTechs.manufacturing,
            industry,
            1,
            game.settings.galaxy.productionTicks,
        );
    }

    calculateStarManufacturing(game: Game<ID>, star: Star<ID>) {
        const effectiveTechs =
            this.technologyService.getStarEffectiveTechnologyLevels(game, star);
        const ind = star.infrastructure?.industry ?? 0;

        return this.calculateStarShipsByTicks(
            effectiveTechs.manufacturing,
            ind,
            1,
            game.settings.galaxy.productionTicks,
        );
    }
}
