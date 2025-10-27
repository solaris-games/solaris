import { Game } from './types/Game';
import { Player } from './types/Player';
import { Star } from './types/Star';
import PlayerStatisticsService from './playerStatistics';
import StarService from './star';
import { TechnologyService } from 'solaris-common';
import SpecialistService from './specialist';
import { StarDataService } from "solaris-common";

export default class PlayerCycleRewardsService {
    starService: StarService;
    technologyService: TechnologyService;
    playerStatisticsService: PlayerStatisticsService;
    specialistService: SpecialistService;
    starDataService: StarDataService;

    constructor(
        starService: StarService,
        technologyService: TechnologyService,
        playerStatisticsService: PlayerStatisticsService,
        specialistService: SpecialistService,
        starDataService: StarDataService,
    ) {
        this.starService = starService;
        this.technologyService = technologyService;
        this.playerStatisticsService = playerStatisticsService;
        this.specialistService = specialistService;
        this.starDataService = starDataService;
    }

    calculatePlayerCreditsEndOfCycleRewards(game: Game, player: Player) {
        let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        let totalEco = this.playerStatisticsService.calculateTotalEconomy(playerStars);

        let creditsFromEconomy = totalEco * 10;
        let creditsFromBanking = this._getBankingReward(game, player, playerStars, totalEco);
        let creditsTotal = creditsFromEconomy + creditsFromBanking;
        let creditsFromSpecialistsTechnology = this._getCreditsSpecialistsReward(game, player, playerStars);

        return {
            creditsFromEconomy,
            creditsFromBanking,
            creditsTotal,
            creditsFromSpecialistsTechnology
        };
    }

    givePlayerCreditsEndOfCycleRewards(game: Game, player: Player) {
        let rewards = this.calculatePlayerCreditsEndOfCycleRewards(game, player);

        player.credits += rewards.creditsTotal;
        player.creditsSpecialists += rewards.creditsFromSpecialistsTechnology;

        return rewards;
    }

    _getBankingReward(game: Game, player: Player, playerStars: Star[], totalEco: number) {
        let isBankingEnabled = this.technologyService.isTechnologyEnabled(game, 'banking');

        if (!isBankingEnabled || !playerStars.length) { // Players must have stars in order to get credits from banking.
            return 0;
        }

        let banking = player.research.banking.level;
        let multiplier = game.constants.player.bankingCycleRewardMultiplier;

        switch (game.settings.technology.bankingReward) {
            case 'standard':
                return Math.round((banking * multiplier) + (0.15 * banking * totalEco));
            case 'legacy':
                return banking * multiplier;
        }

        throw new Error(`Unsupported banking reward type: ${game.settings.technology.bankingReward}.`);
    }

    _getCreditsSpecialistsReward(game: Game, player: Player, playerStars: Star[]) {
        if (!playerStars.length) {
            return 0;
        }

        let isSpecialistsCreditsEnabled = this.technologyService.isTechnologyEnabled(game, 'specialists');
        let isCreditsSpecialistsCurrency = game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists';

        if (!isSpecialistsCreditsEnabled || !isCreditsSpecialistsCurrency) {
            return 0;
        }

        let starCount = playerStars.length;
        let specialists = player.research.specialists.level;

        switch (game.settings.technology.specialistTokenReward) {
            case 'standard':
                return specialists;
            case 'experimental':
                const factor = 2 / game.settings.galaxy.starsPerPlayer;
                return Math.ceil(Math.min(starCount * specialists * factor, specialists));
        }

        throw new Error(`Unsupported specialist reward type: ${game.settings.technology.specialistTokenReward}.`);
    }

    giveFinancialAnalystCredits(game: Game) {
        for (let player of game.galaxy.players) {
            let playerStars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id)
                                .filter(s => !this.starDataService.isDeadStar(s));

            for (let star of playerStars) {
                let creditsByScience = this.specialistService.getCreditsPerTickByScience(star);

                player.credits += creditsByScience * star.infrastructure.science!;
            }
        }
    }

}
