import type { Game } from "../types/common/game";
import type { Player } from "../types/common/player";
import type { Star } from "../types/common/star";
import type { Id } from "../types/id";
import type { TechnologyService } from "./technology";
import type { StarDataService } from "./starData";
import { SpecialistValueService } from "./specialistValue";
import { PlayerStatisticsService } from "./playerStatistics";

interface IStarService<ID> {
    listStarsOwnedByPlayer(stars: Star<ID>[], playerId: ID): Star<ID>[];
}

export type PlayerCycleCreditsRewards = {
    creditsFromEconomy: number;
    creditsFromBanking: number;
    creditsTotal: number;
    creditsFromSpecialistsTechnology: number;
};

export class PlayerIncomeService<ID extends Id> {
    constructor(
        private starService: IStarService<ID>,
        private technologyService: TechnologyService,
        private playerStatisticsService: PlayerStatisticsService<ID>,
        private starDataService: StarDataService,
        private specialistValueService: SpecialistValueService,
    ) {}

    calculateEconomyCredits(economy: number) {
        return economy * 10;
    }

    calculatePlayerCreditsEndOfCycleRewards(
        game: Game<ID>,
        player: Player<ID>,
    ): PlayerCycleCreditsRewards {
        const playerStars = this.starService.listStarsOwnedByPlayer(
            game.galaxy.stars,
            player._id,
        );

        const totalEco =
            this.playerStatisticsService.calculateTotalEconomy(playerStars);

        const creditsFromEconomy = this.calculateEconomyCredits(totalEco);
        const creditsFromBanking = this.getBankingReward(
            game,
            player,
            playerStars.length,
            totalEco,
        );
        const creditsTotal = creditsFromEconomy + creditsFromBanking;
        const creditsFromSpecialistsTechnology =
            this.getCreditsSpecialistsReward(game, player, playerStars.length);

        return {
            creditsFromEconomy,
            creditsFromBanking,
            creditsTotal,
            creditsFromSpecialistsTechnology,
        };
    }

    getBankingReward(
        game: Game<ID>,
        player: Player<ID>,
        playerStarCount: number,
        totalEco: number,
    ) {
        const isBankingEnabled = this.technologyService.isTechnologyEnabled(
            game,
            "banking",
        );

        if (!isBankingEnabled || playerStarCount === 0) {
            // Players must have stars in order to get credits from banking.
            return 0;
        }

        const banking = player.research.banking.level;
        const multiplier = game.constants.player.bankingCycleRewardMultiplier;

        switch (game.settings.technology.bankingReward) {
            case "standard":
                return Math.round(
                    banking * multiplier + 0.15 * banking * totalEco,
                );
            case "legacy":
                return banking * multiplier;
        }
    }

    getCreditsSpecialistsReward(
        game: Game<ID>,
        player: Player<ID>,
        playerStarCount: number,
    ) {
        if (playerStarCount === 0) {
            return 0;
        }

        const isSpecialistsCreditsEnabled =
            this.technologyService.isTechnologyEnabled(game, "specialists");
        const isCreditsSpecialistsCurrency =
            game.settings.specialGalaxy.specialistsCurrency ===
            "creditsSpecialists";

        if (!isSpecialistsCreditsEnabled || !isCreditsSpecialistsCurrency) {
            return 0;
        }

        const specialists = player.research.specialists.level;

        switch (game.settings.technology.specialistTokenReward) {
            case "simplified":
                return specialists;
            case "dependsOnStarCount":
                const factor = 2 / game.settings.galaxy.starsPerPlayer;
                return Math.ceil(
                    Math.min(
                        playerStarCount * specialists * factor,
                        specialists,
                    ),
                );
        }
    }

    calculatePerTickIncome(game: Game<ID>, player: Player<ID>) {
        const playerStars = this.starService
            .listStarsOwnedByPlayer(game.galaxy.stars, player._id)
            .filter((s) => !this.starDataService.isDeadStar(s));

        let credits = 0;

        for (let star of playerStars) {
            if (!star.infrastructure.science) {
                continue;
            }

            const creditsByScience =
                this.specialistValueService.getCreditsPerTickByScience(star);

            credits += creditsByScience * star.infrastructure.science!;
        }

        return credits;
    }
}
