import ValidationError from "../errors/validation";
import { Game } from "../types/Game";
import { Player } from "../types/Player";

export default class DiplomacyUpkeepService {

    constructor() {
        
    }

    async deductUpkeep(game: Game, player: Player, creditsFromEconomy: number, allianceCount: number) {
        if (game.settings.alliances.allianceUpkeepCost !== 'none') {
            throw new Error(`Alliance upkeep is not enabled in this game`);
        }

        let upkeep = this.getUpkeepCost(game, creditsFromEconomy, allianceCount);

        if (!upkeep) {
            return;
        }

        // if (player.credits < upkeep.totalCost) {
        //     throw new ValidationError(`You cannot afford to declare an alliance with this player. The upfront alliance cost is ${upkeep.totalCost} credits.`);
        // }

        // await this.playerCreditsService.addCredits(game, player, -upkeep.totalCost);

        player.credits -= upkeep.totalCost;
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

};
