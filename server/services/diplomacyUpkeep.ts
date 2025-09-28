import { ValidationError } from "solaris-common";
import { Game } from "./types/Game";
import { Player } from "./types/Player";
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
        return game.settings.diplomacy.upkeepCost !== 'none';
    }

    async deductUpkeep(game: Game, player: Player, allianceCount: number, saveToDB: boolean = true) {
        if (!this.isAllianceUpkeepEnabled(game)) {
            throw new Error(`Alliance upkeep is not enabled in this game`);
        }

        const cycleRewards = this.playerCycleRewardsService.calculatePlayerCreditsEndOfCycleRewards(game, player);

        let upkeep = this.getUpkeepCost(game, cycleRewards.creditsTotal, allianceCount);

        if (!upkeep) {
            return null;
        }

        if (saveToDB) {
            // Note: The only time we need to validate this is when we are attempting to save to DB
            // as this is currently the only scenario where the function is called from an API request and not internally.
            if (player.credits < upkeep.totalCost) {
                throw new ValidationError(`You cannot afford to declare an alliance with this player. The upfront alliance fee is ${upkeep.totalCost} credits.`);
            }
    
            await this.playerCreditsService.addCredits(game, player, -upkeep.totalCost);
        } else {
            player.credits -= upkeep.totalCost;
        }

        return upkeep;
    }

    deductTotalUpkeep(game: Game, player: Player, creditsTotal: number, allianceCount: number) {
        if (!this.isAllianceUpkeepEnabled(game)) {
            throw new Error(`Alliance upkeep is not enabled in this game`);
        }

        let upkeep = this.getUpkeepCost(game, creditsTotal, allianceCount);

        if (!upkeep) {
            return null;
        }

        player.credits -= upkeep.totalCost;

        return upkeep;
    }
    
    getUpkeepCost(game: Game, creditsTotal: number, allianceCount: number) {
        let costPerAlly = game.constants.diplomacy.upkeepExpenseMultipliers[game.settings.diplomacy.upkeepCost];

        if (costPerAlly === 0) {
            return null;
        }

        let totalCost = Math.round(allianceCount * costPerAlly * creditsTotal);
        
        return {
            allianceCount,
            totalCost
        };
    }

};
