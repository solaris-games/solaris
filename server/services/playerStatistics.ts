import { Carrier } from './types/Carrier';
import { Game } from './types/Game';
import { Player } from './types/Player';
import { Star } from './types/Star';
import CarrierService from './carrier';
import SpecialistService from './specialist';
import StarService from './star';
import { TechnologyService } from 'solaris-common';
import { PlayerStatistics } from './types/Leaderboard';
import ShipService from './ship';

export default class PlayerStatisticsService {
    starService: StarService;
    carrierService: CarrierService;
    technologyService: TechnologyService;
    specialistService: SpecialistService;
    shipService: ShipService;

    constructor(
        starService: StarService,
        carrierService: CarrierService,
        technologyService: TechnologyService,
        specialistService: SpecialistService,
        shipService: ShipService
    ) {
        this.starService = starService;
        this.carrierService = carrierService;
        this.technologyService = technologyService;
        this.specialistService = specialistService;
        this.shipService = shipService;
    }

    getStats(game: Game, player: Player): PlayerStatistics {
        const playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);
        const playerCarriers = this.carrierService.listCarriersOwnedByPlayer(game.galaxy.carriers, player._id);

        const totalStarSpecialists = this.calculateTotalStarSpecialists(playerStars);
        const totalCarrierSpecialists = this.calculateTotalCarrierSpecialists(playerCarriers);

        const totalStars = playerStars.length;
        const totalHomeStars = this.calculateTotalHomeStars(playerStars);

        return {
            totalStars: totalStars,
            totalHomeStars: totalHomeStars,
            totalCarriers: playerCarriers.length,
            totalShips: this.shipService.calculateTotalShips(playerStars, playerCarriers),
            totalShipsMax: this.shipService.calculatePopulationCap(game, player._id)?.shipsMaximum || null,
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

    calculateTotalStars(player: Player, stars: Star[]) {
        const playerStars = this.starService.listStarsOwnedByPlayer(stars, player._id);

        return playerStars.length;
    }

    calculateTotalHomeStars(playerStars: Star[]) {
        return playerStars.filter(s => s.homeStar).length;
    }

    calculateTotalEconomy(playerStars: Star[]) {
        const totalEconomy = playerStars.reduce((sum, s) => {
            const multiplier = this.specialistService.getEconomyInfrastructureMultiplier(s);
            const eco = s.infrastructure?.economy ?? 0;

            return sum + (eco * multiplier)
        }, 0);

        return totalEconomy;
    }

    calculateTotalIndustry(playerStars: Star[]) {
        const totalIndustry = playerStars.reduce((sum, s) => {
            const ind = s.infrastructure?.industry ?? 0;

            return sum + ind;
        }, 0);

        return totalIndustry;
    }

    calculateTotalScience(game: Game, playerStars: Star[]) {
        const totalScience = playerStars.reduce((sum, s) => {
            const specialistMultiplier = this.specialistService.getScienceInfrastructureMultiplier(s);
            const sci = s.infrastructure?.science ?? 0;

            return sum + Math.floor(sci * specialistMultiplier * game.constants.research.sciencePointMultiplier)
        }, 0);

        return totalScience;
    }

    calculateTotalManufacturing(game: Game, playerStars: Star[]) {
        // Calculate the manufacturing level for all of the stars the player owns.
        const totalManufacturing = playerStars.reduce((sum, s) => {
            return sum + this.shipService.calculateStarManufacturing(game, s);
        }, 0);
        
        return Math.round((totalManufacturing + Number.EPSILON) * 100) / 100
    }

    calculateWarpgates(playerStars: Star[]) {
        return playerStars.reduce((sum, s) => s.warpGate ? sum + 1 : sum, 0);
    }

    calculateTotalCarriers(player: Player, carriers: Carrier[]) {
        const playerCarriers = this.carrierService.listCarriersOwnedByPlayer(carriers, player._id);

        return playerCarriers.length;
    }

    calculateTotalStarSpecialists(playerStars: Star[]) {
        return playerStars.filter(s => s.specialistId).length;
    }

    calculateTotalCarrierSpecialists(playerCarriers: Carrier[]) {
        return playerCarriers.filter(c => c.specialistId).length;
    }

}
