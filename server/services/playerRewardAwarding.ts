import { Game } from "./types/Game";
import { Player } from "./types/Player";
import { PlayerIncomeService, StarDataService } from "@solaris/common";
import StarService from "./star";
import SpecialistService from "./specialist";
import { DBObjectId } from "./types/DBObjectId";

export default class RewardAwardingService {
    playerIncomeService: PlayerIncomeService<DBObjectId>;
    starService: StarService;
    specialistService: SpecialistService;
    starDataService: StarDataService;

    constructor(
        playerIncomeService: PlayerIncomeService<DBObjectId>,
        starService: StarService,
        specialistService: SpecialistService,
        starDataService: StarDataService,
    ) {
        this.playerIncomeService = playerIncomeService;
        this.starService = starService;
        this.specialistService = specialistService;
        this.starDataService = starDataService;
    }

    givePlayerCreditsEndOfCycleRewards(game: Game, player: Player) {
        const rewards =
            this.playerIncomeService.calculatePlayerCreditsEndOfCycleRewards(
                game,
                player,
            );

        player.credits += rewards.creditsTotal;
        player.creditsSpecialists += rewards.creditsFromSpecialistsTechnology;

        return rewards;
    }

    giveFinancialAnalystCredits(game: Game) {
        for (let player of game.galaxy.players) {
            const credits = this.playerIncomeService.calculatePerTickIncome(
                game,
                player,
            );

            player.credits += credits;
        }
    }
}
