import type { Game } from "../types/common/game";
import type { Player } from "../types/common/player";
import type { Star } from "../types/common/star";
import type { Id } from "../types/id";
import type { TechnologyService } from "./technology";
import type { StarDataService } from "./starData";

export interface IStarService<ID> {
    listStarsOwnedByPlayer(stars: Star<ID>[], playerId: ID): Star<ID>[];
}

export interface IPlayerStatisticsService<ID> {
    calculateTotalEconomy(playerStars: Star<ID>[]): number;
}

export type PlayerCycleCreditsRewards = {
    creditsFromEconomy: number;
    creditsFromBanking: number;
    creditsTotal: number;
    creditsFromSpecialistsTechnology: number;
};

export class PlayerCycleRewardsService<ID extends Id> {
    starService: IStarService<ID>;
    technologyService: TechnologyService;
    playerStatisticsService: IPlayerStatisticsService<ID>;
    starDataService: StarDataService;

    constructor(
        starService: IStarService<ID>,
        technologyService: TechnologyService,
        playerStatisticsService: IPlayerStatisticsService<ID>,
        starDataService: StarDataService,
    ) {
        this.starService = starService;
        this.technologyService = technologyService;
        this.playerStatisticsService = playerStatisticsService;
        this.starDataService = starDataService;
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

        const creditsFromEconomy = totalEco * 10;
        const creditsFromBanking = this._getBankingReward(
            game,
            player,
            playerStars,
            totalEco,
        );
        const creditsTotal = creditsFromEconomy + creditsFromBanking;
        const creditsFromSpecialistsTechnology =
            this._getCreditsSpecialistsReward(game, player, playerStars);

        return {
            creditsFromEconomy,
            creditsFromBanking,
            creditsTotal,
            creditsFromSpecialistsTechnology,
        };
    }

    _getBankingReward(
        game: Game<ID>,
        player: Player<ID>,
        playerStars: Star<ID>[],
        totalEco: number,
    ) {
        let isBankingEnabled = this.technologyService.isTechnologyEnabled(
            game,
            "banking",
        );

        if (!isBankingEnabled || !playerStars.length) {
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

    _getCreditsSpecialistsReward(
        game: Game<ID>,
        player: Player<ID>,
        playerStars: Star<ID>[],
    ) {
        if (!playerStars.length) {
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

        const starCount = playerStars.length;
        const specialists = player.research.specialists.level;

        switch (game.settings.technology.specialistTokenReward) {
            case "simplified":
                return specialists;
            case "dependsOnStarCount":
                const factor = 2 / game.settings.galaxy.starsPerPlayer;
                return Math.ceil(
                    Math.min(starCount * specialists * factor, specialists),
                );
        }
    }
}
