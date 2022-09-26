import StarService from "./star";
import TechnologyService from "./technology";
import { DBObjectId } from "./types/DBObjectId";
import { Game } from "./types/Game";
import { Star } from "./types/Star";

export default class StarShipService {

    starService: StarService;
    technologyService: TechnologyService;

    constructor(
        starService: StarService,
        technologyService: TechnologyService
    ) {
        this.starService = starService;
        this.technologyService = technologyService;
    }

    isPopulationCapped(game: Game) {
        return game.settings.player.populationCap !== 'none';
    }

    calculatePopulationCap(game: Game, playerStars: Star[]): number | null {
        if (!this.isPopulationCapped(game)) {
            return null;
        }

        let totalHomeStars = playerStars.filter(s => s.homeStar).length;

        return totalHomeStars * game.constants.player.populationCapMultiplier[game.settings.player.populationCap];
    }

    hasReachedPopulationCap(game: Game, playerId: DBObjectId) {
        if (!this.isPopulationCapped(game)) {
            return false;
        }

        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, playerId);
        const currentPopulation = playerStars.reduce((prev, curr) => prev + curr.ships!, 0);
        const populationCap = this.calculatePopulationCap(game, playerStars);

        return currentPopulation >= populationCap!;
    }

    produceShips(game: Game) {
        let starsToProduce = game.galaxy.stars.filter(s => s.infrastructure.industry! > 0);

        for (let i = 0; i < starsToProduce.length; i++) {
            let star = starsToProduce[i];

            if (star.ownedByPlayerId) {
                if (this.hasReachedPopulationCap(game, star.ownedByPlayerId)) {
                    continue;
                }

                let effectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(game, star);

                // Increase the number of ships garrisoned by how many are manufactured this tick.
                star.shipsActual! += this.calculateStarShipsByTicks(effectiveTechs.manufacturing, star.infrastructure.industry!, 1, game.settings.galaxy.productionTicks);
                star.ships = Math.floor(star.shipsActual!);
            }
        }
    }

    calculateStarShipsByTicks(techLevel: number, industryLevel: number, ticks: number = 1, productionTicks: number = 24) {
        // A star produces Y*(X+5) ships every 24 ticks where X is your manufacturing tech level and Y is the amount of industry at a star.
        return +((industryLevel * (techLevel + 5) / productionTicks) * ticks).toFixed(2);
    }

};
