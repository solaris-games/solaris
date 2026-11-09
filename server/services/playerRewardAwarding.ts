import { Game } from "./types/Game";
import { Player } from "./types/Player";
import { PlayerCycleRewardsService, StarDataService } from "@solaris/common";
import StarService from "./star";
import SpecialistService from "./specialist";
import { DBObjectId } from "./types/DBObjectId";

export default class RewardAwardingService {
    playerCycleRewardsService: PlayerCycleRewardsService<DBObjectId>;
    starService: StarService;
    specialistService: SpecialistService;
    starDataService: StarDataService;

    constructor(
        playerCycleRewardsService: PlayerCycleRewardsService<DBObjectId>,
        starService: StarService,
        specialistService: SpecialistService,
        starDataService: StarDataService,
    ) {
        this.playerCycleRewardsService = playerCycleRewardsService;
        this.starService = starService;
        this.specialistService = specialistService;
        this.starDataService = starDataService;
    }

    givePlayerCreditsEndOfCycleRewards(game: Game, player: Player) {
        const rewards =
            this.playerCycleRewardsService.calculatePlayerCreditsEndOfCycleRewards(
                game,
                player,
            );

        player.credits += rewards.creditsTotal;
        player.creditsSpecialists += rewards.creditsFromSpecialistsTechnology;

        return rewards;
    }

    giveFinancialAnalystCredits(game: Game) {
        for (let player of game.galaxy.players) {
            const credits =
                this.playerCycleRewardsService.calculatePerTickIncome(
                    game,
                    player,
                );

            player.credits += credits;
        }
    }
}
