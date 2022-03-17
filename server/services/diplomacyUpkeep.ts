import ValidationError from "../errors/validation";
import { Game } from "../types/Game";
import { Player } from "../types/Player";
import DiplomacyService from "./diplomacy";
import PlayerCreditsService from "./playerCredits";

export default class DiplomacyUpkeepService {

    diplomacyService: DiplomacyService;
    playerCreditsService: PlayerCreditsService;

    constructor(
        diplomacyService: DiplomacyService,
        playerCreditsService: PlayerCreditsService
    ) {
        this.diplomacyService = diplomacyService;
        this.playerCreditsService = playerCreditsService;
    }

    async deductUpkeep(game: Game, player: Player, allianceCount: number) {
        if (game.settings.alliances.allianceUpkeepCost !== 'none') {
            throw new Error(`Alliance upkeep is not enabled in this game`);
        }

        let cycleRewards = this.playerCreditsService.calculatePlayerCreditsEndOfCycleRewards(game, player);

        let upkeep = this.getUpkeepCost(game, cycleRewards.creditsFromEconomy, allianceCount);

        if (!upkeep) {
            return;
        }

        if (player.credits < upkeep.totalCost) {
            throw new ValidationError(`You cannot afford to declare an alliance with this player. The upfront alliance cost is ${upkeep.totalCost} credits.`);
        }

        await this.playerCreditsService.addCredits(game, player, -upkeep.totalCost);
    }
    
    deductTotalUpkeepCost(game: Game, player: Player, creditsFromEconomy: number) {
        let upkeep = this.getTotalUpkeepCost(game, player, creditsFromEconomy);

        if (upkeep == null) {
            return null;
        }

        player.credits -= upkeep.totalCost;

        return upkeep;
    }

    getUpkeepCost(game: Game, creditsFromEconomy: number, allianceCount: number) {
        if (game.settings.alliances.allianceUpkeepCost === 'none') {
            return null;
        }

        let costPerAlly = game.constants.alliances.upkeepExpenseMultipliers[game.settings.alliances.allianceUpkeepCost];

        if (costPerAlly === 0) {
            return null;
        }

        let totalCost = Math.round(allianceCount * costPerAlly * creditsFromEconomy);
        
        return {
            allianceCount,
            totalCost
        };
    }

    getTotalUpkeepCost(game: Game, player: Player, creditsFromEconomy: number) {
        if (game.settings.alliances.allianceUpkeepCost === 'none') {
            return null;
        }

        let allianceCount = this.diplomacyService.getAlliesOfPlayer(game, player).length;

        return this.getUpkeepCost(game, creditsFromEconomy, allianceCount);
    }

};
