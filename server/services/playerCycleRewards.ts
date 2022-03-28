import DatabaseRepository from '../models/DatabaseRepository';
import { Game } from '../types/Game';
import { Player } from '../types/Player';
import { Star } from '../types/Star';
import PlayerStatisticsService from './playerStatistics';
import StarService from './star';
import TechnologyService from './technology';

export default class PlayerCycleRewardsService {
    starService: StarService;
    technologyService: TechnologyService;
    playerStatisticsService: PlayerStatisticsService;

    constructor(
        starService: StarService,
        technologyService: TechnologyService,
        playerStatisticsService: PlayerStatisticsService
    ) {
        this.starService = starService;
        this.technologyService = technologyService;
        this.playerStatisticsService = playerStatisticsService;
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

        switch (game.settings.technology.bankingReward) {
            case 'standard':
                return Math.round((banking * 75) + (0.15 * banking * totalEco));
            case 'legacy':
                return banking * 75;
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
                return Math.ceil(Math.min(starCount * specialists * 0.1, specialists));
        }

        throw new Error(`Unsupported specialist reward type: ${game.settings.technology.specialistTokenReward}.`);
    }

}
