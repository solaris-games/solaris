import ValidationError from "../errors/validation";
import { Game } from "../types/Game";
import { Player } from "../types/Player";
import PlayerCreditsService from "./playerCredits";
import PlayerCycleRewardsService from "./playerCycleRewards";

export default class DiplomacyUpkeepService {

    playerCreditsService: PlayerCreditsService;
    playerCycleRewardsService: PlayerCycleRewardsService;

    constructor(
        playerCreditsService: PlayerCreditsService,
        playerCycleRewardsService: PlayerCycleRewardsService
    ) {
        this.playerCycleRewardsService = playerCycleRewardsService;
        this.playerCreditsService = playerCreditsService;
    }

    isAllianceUpkeepEnabled(game: Game) {
        return game.settings.alliances.allianceUpkeepCost !== 'none';
    }

    async deductUpkeep(game: Game, player: Player, allianceCount: number) {
        if (!this.isAllianceUpkeepEnabled(game)) {
            throw new Error(`Alliance upkeep is not enabled in this game`);
        }

        const cycleRewards = this.playerCycleRewardsService.calculatePlayerCreditsEndOfCycleRewards(game, player);

        let upkeep = this.getUpkeepCost(game, cycleRewards.creditsFromEconomy, allianceCount);

        if (!upkeep) {
            return null;
        }

        if (player.credits < upkeep.totalCost) {
            throw new ValidationError(`You cannot afford to declare an alliance with this player. The upfront alliance cost is ${upkeep.totalCost} credits.`);
        }

        await this.playerCreditsService.addCredits(game, player, -upkeep.totalCost);

        return upkeep;
    }

    deductTotalUpkeep(game: Game, player: Player, creditsFromEconomy: number, allianceCount: number) {
        if (!this.isAllianceUpkeepEnabled(game)) {
            throw new Error(`Alliance upkeep is not enabled in this game`);
        }

        let upkeep = this.getUpkeepCost(game, creditsFromEconomy, allianceCount);

        if (!upkeep) {
            return null;
        }

        player.credits -= upkeep.totalCost;

        return upkeep;
    }
    
    getUpkeepCost(game: Game, creditsFromEconomy: number, allianceCount: number) {
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
