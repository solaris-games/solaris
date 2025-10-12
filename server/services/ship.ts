import CarrierService from "./carrier";
import StarService from "./star";
import { TechnologyService } from 'solaris-common';
import {Carrier} from "./types/Carrier";
import {DBObjectId} from "./types/DBObjectId";
import {Game} from "./types/Game";
import {Star} from "./types/Star";

export interface IPlayerPopulationCap {
    shipsCurrent: number;
    shipsMaximum: number;
    difference: number;
    isPopulationCapped: boolean;
}

export default class ShipService {

    starService: StarService;
    technologyService: TechnologyService;
    carrierService: CarrierService;

    constructor(
        starService: StarService,
        technologyService: TechnologyService,
        carrierService: CarrierService
    ) {
        this.starService = starService;
        this.technologyService = technologyService;
        this.carrierService = carrierService;
    }

    isPopulationRestricted(game: Game) {
        return game.settings.player.populationCap.enabled === 'enabled';
    }

    calculateTotalShips(ownedStars: Star[], ownedCarriers: Carrier[]) {
        return ownedStars.filter(s => s.ships != null).reduce((sum, s) => sum + s.ships!, 0)
            + ownedCarriers.filter(c => c.ships != null).reduce((sum, c) => sum + c.ships!, 0);
    }

    calculatePopulationCap(game: Game, playerId: DBObjectId): IPlayerPopulationCap | null {
        if (!this.isPopulationRestricted(game)) {
            return null;
        }

        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, playerId);
        const playerCarriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, playerId);

        const shipsCurrent = this.calculateTotalShips(playerStars, playerCarriers);
        const shipsMaximum = (game.settings.player.populationCap.shipsPerStar * 3) + (playerStars.length * game.settings.player.populationCap.shipsPerStar);
        const difference = shipsMaximum - shipsCurrent;
        const isPopulationCapped = shipsCurrent >= shipsMaximum;

        return {
            shipsCurrent,
            shipsMaximum,
            difference,
            isPopulationCapped
        }
    }

    produceShips(game: Game) {
        const starsToProduce = game.galaxy.stars.filter(s => s.infrastructure.industry! > 0);

        for (let i = 0; i < starsToProduce.length; i++) {
            let star = starsToProduce[i];

            if (star.ownedByPlayerId) {
                // Note: We recalculate the pop cap every time we produce ships so that it is always up to date.
                const cap = this.calculatePopulationCap(game, star.ownedByPlayerId!);

                if (cap?.isPopulationCapped) {
                    continue;
                }

                const productionShips = this.calculateStarShipProduction(game, star, cap);

                // Increase the number of ships garrisoned by how many are manufactured this tick.
                star.shipsActual! += productionShips;
                star.ships = Math.floor(star.shipsActual!);
            }
        }
    }

    calculateStarShipProduction(game: Game, star: Star, populationCap: IPlayerPopulationCap | null) {
        const starEffectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        // If there is a population cap then we need to determine how many ships are allowed to be built at this star so we don't exceed pop cap
        const maximumShipsAllowed = populationCap ? Math.max(populationCap.difference, 0) : null;
        
        let productionShips = this.calculateStarShipsByTicks(starEffectiveTechs.manufacturing, star.infrastructure.industry!, 1, game.settings.galaxy.productionTicks);

        if (maximumShipsAllowed) {
            productionShips = Math.min(productionShips, maximumShipsAllowed);
        }

        return productionShips;
    }   

    calculateStarShipsByTicks(techLevel: number, industryLevel: number, ticks: number = 1, productionTicks: number = 24) {
        // A star produces Y*(X+5) ships every 24 ticks where X is your manufacturing tech level and Y is the amount of industry at a star.
        return +((industryLevel * (techLevel + 5) / productionTicks) * ticks).toFixed(2);
    }

    calculateManufacturingForIndustry(game: Game, star: Star, industry: number) {
        const effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

        return this.calculateStarShipsByTicks(effectiveTechs.manufacturing, industry, 1, game.settings.galaxy.productionTicks);
    }

    calculateStarManufacturing(game: Game, star: Star) {
        const effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);
        const ind = star.infrastructure?.industry ?? 0;

        return this.calculateStarShipsByTicks(effectiveTechs.manufacturing, ind, 1, game.settings.galaxy.productionTicks);
    }

};
