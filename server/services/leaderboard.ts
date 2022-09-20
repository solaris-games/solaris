import Repository from "./repository";
import { Game } from "./types/Game";
import { Leaderboard, LeaderboardPlayer, LeaderboardUser } from "./types/Leaderboard";
import { Player } from "./types/Player";
import { EloRatingChangeResult, GameRankingResult } from "./types/Rating";
import { User } from "./types/User";
import BadgeService from "./badge";
import GameService from "./game";
import GameStateService from "./gameState";
import GameTypeService from "./gameType";
import UserGuildService from "./guildUser";
import PlayerService from "./player";
import PlayerStatisticsService from "./playerStatistics";
import RatingService from "./rating";
import UserService from "./user";
import PlayerAfkService from "./playerAfk";
import UserLevelService from "./userLevel";

const moment = require('moment');

export default class LeaderboardService {
    static GLOBALSORTERS = {
        rank: {
            fullKey: 'achievements.rank',
            sort: {
                'achievements.rank': -1,
                'achievements.victories': -1,
                'achievements.renown': -1
            },
            select: {
                username: 1,
                guildId: 1,
                'roles.contributor': 1,
                'roles.developer': 1,
                'roles.communityManager': 1,
                'roles.gameMaster': 1,
                'achievements.level': 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.renown': 1,
                'achievements.eloRating': 1
            }
        },
        victories: {
            fullKey: 'achievements.victories',
            sort: {
                'achievements.victories': -1,
                'achievements.rank': -1,
                'achievements.renown': -1
            },
            select: {
                username: 1,
                guildId: 1,
                'roles.contributor': 1,
                'roles.developer': 1,
                'roles.communityManager': 1,
                'roles.gameMaster': 1,
                'achievements.level': 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.renown': 1,
                'achievements.eloRating': 1
            }
        },
        renown: {
            fullKey: 'achievements.renown',
            sort: {
                'achievements.renown': -1,
                'achievements.rank': -1,
                'achievements.victories': -1
            },
            select: {
                username: 1,
                guildId: 1,
                'roles.contributor': 1,
                'roles.developer': 1,
                'roles.communityManager': 1,
                'roles.gameMaster': 1,
                'achievements.level': 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.renown': 1,
                'achievements.eloRating': 1
            }
        },
        joined: {
            fullKey: 'achievements.joined',
            sort: {
                'achievements.joined': -1
            },
            select: {
                username: 1,
                'achievements.joined': 1
            }
        },
        completed: {
            fullKey: 'achievements.completed',
            sort: {
                'achievements.completed': -1
            },
            select: {
                username: 1,
                'achievements.completed': 1
            }
        },
        quit: {
            fullKey: 'achievements.quit',
            sort: {
                'achievements.quit': -1
            },
            select: {
                username: 1,
                'achievements.quit': 1
            }
        },
        defeated: {
            fullKey: 'achievements.defeated',
            sort: {
                'achievements.defeated': -1
            },
            select: {
                username: 1,
                'achievements.defeated': 1
            }
        },
        afk: {
            fullKey: 'achievements.afk',
            sort: {
                'achievements.afk': -1
            },
            select: {
                username: 1,
                'achievements.afk': 1
            }
        },
        "ships-killed": {
            fullKey: 'achievements.combat.kills.ships',
            sort: {
                'achievements.combat.kills.ships': -1
            },
            select: {
                username: 1,
                'achievements.combat.kills.ships': 1
            }
        },
        "carriers-killed": {
            fullKey: 'achievements.combat.kills.carriers',
            sort: {
                'achievements.combat.kills.carriers': -1
            },
            select: {
                username: 1,
                'achievements.combat.kills.carriers': 1
            }
        },
        "specialists-killed": {
            fullKey: 'achievements.combat.kills.specialists',
            sort: {
                'achievements.combat.kills.specialists': -1
            },
            select: {
                username: 1,
                'achievements.combat.kills.specialists': 1
            }
        },
        "ships-lost": {
            fullKey: 'achievements.combat.losses.ships',
            sort: {
                'achievements.combat.losses.ships': -1
            },
            select: {
                username: 1,
                'achievements.combat.losses.ships': 1
            }
        },
        "carriers-lost": {
            fullKey: 'achievements.combat.losses.carriers',
            sort: {
                'achievements.combat.losses.carriers': -1
            },
            select: {
                username: 1,
                'achievements.combat.losses.carriers': 1
            }
        },
        "specialists-lost": {
            fullKey: 'achievements.combat.losses.specialists',
            sort: {
                'achievements.combat.losses.specialists': -1
            },
            select: {
                username: 1,
                'achievements.combat.losses.specialists': 1
            }
        },
        "stars-captured": {
            fullKey: 'achievements.combat.stars.captured',
            sort: {
                'achievements.combat.stars.captured': -1
            },
            select: {
                username: 1,
                'achievements.combat.stars.captured': 1
            }
        },
        "stars-lost": {
            fullKey: 'achievements.combat.stars.lost',
            sort: {
                'achievements.combat.stars.lost': -1
            },
            select: {
                username: 1,
                'achievements.combat.stars.lost': 1
            }
        },
        "home-stars-captured": {
            fullKey: 'achievements.combat.homeStars.captured',
            sort: {
                'achievements.combat.homeStars.captured': -1
            },
            select: {
                username: 1,
                'achievements.combat.homeStars.captured': 1
            }
        },
        "home-stars-lost": {
            fullKey: 'achievements.combat.homeStars.lost',
            sort: {
                'achievements.combat.homeStars.lost': -1
            },
            select: {
                username: 1,
                'achievements.combat.homeStars.lost': 1
            }
        },
        "economy": {
            fullKey: 'achievements.infrastructure.economy',
            sort: {
                'achievements.infrastructure.economy': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.economy': 1
            }
        },
        "industry": {
            fullKey: 'achievements.infrastructure.industry',
            sort: {
                'achievements.infrastructure.industry': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.industry': 1
            }
        },
        "science": {
            fullKey: 'achievements.infrastructure.science',
            sort: {
                'achievements.infrastructure.science': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.science': 1
            }
        },
        "warpgates-built": {
            fullKey: 'achievements.infrastructure.warpGates',
            sort: {
                'achievements.infrastructure.warpGates': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.warpGates': 1
            }
        },
        "warpgates-destroyed": {
            fullKey: 'achievements.infrastructure.warpGatesDestroyed',
            sort: {
                'achievements.infrastructure.warpGatesDestroyed': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.warpGatesDestroyed': 1
            }
        },
        "carriers-built": {
            fullKey: 'achievements.infrastructure.carriers',
            sort: {
                'achievements.infrastructure.carriers': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.carriers': 1
            }
        },
        "specialists-hired": {
            fullKey: 'achievements.infrastructure.specialistsHired',
            sort: {
                'achievements.infrastructure.specialistsHired': -1
            },
            select: {
                username: 1,
                'achievements.infrastructure.specialistsHired': 1
            }
        },
        "scanning": {
            fullKey: 'achievements.research.scanning',
            sort: {
                'achievements.research.scanning': -1
            },
            select: {
                username: 1,
                'achievements.research.scanning': 1
            }
        },
        "hyperspace": {
            fullKey: 'achievements.research.hyperspace',
            sort: {
                'achievements.research.hyperspace': -1
            },
            select: {
                username: 1,
                'achievements.research.hyperspace': 1
            }
        },
        "terraforming": {
            fullKey: 'achievements.research.terraforming',
            sort: {
                'achievements.research.terraforming': -1
            },
            select: {
                username: 1,
                'achievements.research.terraforming': 1
            }
        },
        "experimentation": {
            fullKey: 'achievements.research.experimentation',
            sort: {
                'achievements.research.experimentation': -1
            },
            select: {
                username: 1,
                'achievements.research.experimentation': 1
            }
        },
        "weapons": {
            fullKey: 'achievements.research.weapons',
            sort: {
                'achievements.research.weapons': -1
            },
            select: {
                username: 1,
                'achievements.research.weapons': 1
            }
        },
        "banking": {
            fullKey: 'achievements.research.banking',
            sort: {
                'achievements.research.banking': -1
            },
            select: {
                username: 1,
                'achievements.research.banking': 1
            }
        },
        "manufacturing": {
            fullKey: 'achievements.research.manufacturing',
            sort: {
                'achievements.research.manufacturing': -1
            },
            select: {
                username: 1,
                'achievements.research.manufacturing': 1
            }
        },
        "specialists": {
            fullKey: 'achievements.research.specialists',
            sort: {
                'achievements.research.specialists': -1
            },
            select: {
                username: 1,
                'achievements.research.specialists': 1
            }
        },
        "credits-sent": {
            fullKey: 'achievements.trade.creditsSent',
            sort: {
                'achievements.trade.creditsSent': -1
            },
            select: {
                username: 1,
                'achievements.trade.creditsSent': 1
            }
        },
        "credits-received": {
            fullKey: 'achievements.trade.creditsReceived',
            sort: {
                'achievements.trade.creditsReceived': -1
            },
            select: {
                username: 1,
                'achievements.trade.creditsReceived': 1
            }
        },
        "technologies-sent": {
            fullKey: 'achievements.trade.technologySent',
            sort: {
                'achievements.trade.technologySent': -1
            },
            select: {
                username: 1,
                'achievements.trade.technologySent': 1
            }
        },
        "technologies-received": {
            fullKey: 'achievements.trade.technologyReceived',
            sort: {
                'achievements.trade.technologyReceived': -1
            },
            select: {
                username: 1,
                'achievements.trade.technologyReceived': 1
            }
        },
        "ships-gifted": {
            fullKey: 'achievements.trade.giftsSent',
            sort: {
                'achievements.trade.giftsSent': -1
            },
            select: {
                username: 1,
                'achievements.trade.giftsSent': 1
            }
        },
        "ships-received": {
            fullKey: 'achievements.trade.giftsReceived',
            sort: {
                'achievements.trade.giftsReceived': -1
            },
            select: {
                username: 1,
                'achievements.trade.giftsReceived': 1
            }
        },
        "renown-sent": {
            fullKey: 'achievements.trade.renownSent',
            sort: {
                'achievements.trade.renownSent': -1
            },
            select: {
                username: 1,
                'achievements.trade.renownSent': 1
            }
        },
        "elo-rating": {
            fullKey: 'achievements.eloRating',
            query: {
                'achievements.eloRating': { $ne: null }
            },
            sort: {
                'achievements.eloRating': -1,
                'achievements.rank': -1,
                'achievements.victories1v1': -1,
                'achievements.renown': -1
            },
            select: {
                username: 1,
                guildId: 1,
                'roles.contributor': 1,
                'roles.developer': 1,
                'roles.communityManager': 1,
                'roles.gameMaster': 1,
                'achievements.level': 1,
                'achievements.rank': 1,
                'achievements.victories': 1,
                'achievements.victories1v1': 1,
                'achievements.defeated1v1': 1,
                'achievements.renown': 1,
                'achievements.eloRating': 1
            }
        }
    }

    static LOCALSORTERS = {
        stars: 'stats.totalStars',
        carriers: 'stats.totalCarriers',
        ships: 'stats.totalShips',
        economy: 'stats.totalEconomy',
        industry: 'stats.totalIndustry',
        science: 'stats.totalScience',
        newShips: 'stats.newShips',
        warpgates: 'stats.warpgates',
        starSpecialists: 'stats.totalStarSpecialists',
        carrierSpecialists: 'stats.totalCarrierSpecialists',
        totalSpecialists: 'stats.totalSpecialists',
        scanning: 'player.research.scanning.level',
        hyperspace: 'player.research.hyperspace.level',
        terraforming: 'player.research.terraforming.level',
        experimentation: 'player.research.experimentation.level',
        weapons: 'player.research.weapons.level',
        banking: 'player.research.banking.level',
        manufacturing: 'player.research.manufacturing.level',
        specialists: 'player.research.specialists.level'
    }

    userRepo: Repository<User>;
    userService: UserService;
    playerService: PlayerService;
    playerAfkService: PlayerAfkService;
    userLevelService: UserLevelService;
    guildUserService: UserGuildService;
    ratingService: RatingService;
    gameService: GameService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    badgeService: BadgeService;
    playerStatisticsService: PlayerStatisticsService;

    constructor(
        userRepo: Repository<User>,
        userService: UserService,
        playerService: PlayerService,
        playerAfkService: PlayerAfkService,
        userLevelService: UserLevelService,
        guildUserService: UserGuildService,
        ratingService: RatingService,
        gameService: GameService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        badgeService: BadgeService,
        playerStatisticsService: PlayerStatisticsService
    ) {
        this.userRepo = userRepo;
        this.userService = userService;
        this.playerService = playerService;
        this.playerAfkService = playerAfkService;
        this.userLevelService = userLevelService;
        this.guildUserService = guildUserService;
        this.ratingService = ratingService;
        this.gameService = gameService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.badgeService = badgeService;
        this.playerStatisticsService = playerStatisticsService;
    }

    async getUserLeaderboard(limit: number | null, sortingKey: string, skip: number = 0) {
        const sorter = LeaderboardService.GLOBALSORTERS[sortingKey] || LeaderboardService.GLOBALSORTERS['rank'];

        let leaderboard = await this.userRepo
            .find(
                sorter.query || {},
                sorter.select,
                sorter.sort,
                limit,
                skip
            );

        let userIds = leaderboard.map(x => x._id);
        let guildUsers = await this.guildUserService.listUsersWithGuildTags(userIds);

        let guildUserPositions: LeaderboardUser[] = [];

        for (let i = 0; i < leaderboard.length; i++) {
            let user = leaderboard[i];

            let position = i + 1;
            let guild = guildUsers.find(x => x._id.toString() === user._id.toString())?.guild || null;

            guildUserPositions.push({
                ...user,
                position,
                guild
            });
        }

        let totalPlayers = await this.userRepo.countAll();

        return {
            totalPlayers,
            leaderboard: guildUserPositions,
            sorter
        };
    }

    getGameLeaderboard(game: Game, sortingKey?: string): Leaderboard {
        let SORTERS = LeaderboardService.LOCALSORTERS;

        let kingOfTheHillPlayer: Player | null = null;

        if (this.gameTypeService.isKingOfTheHillMode(game)) {
            kingOfTheHillPlayer = this.playerService.getKingOfTheHillPlayer(game);
        }

        let playerStats = game.galaxy.players.map(p => {
            let isKingOfTheHill = kingOfTheHillPlayer != null && p._id.toString() === kingOfTheHillPlayer._id.toString();
            let stats = p.stats ?? this.playerStatisticsService.getStats(game, p);

            return {
                player: p,
                isKingOfTheHill,
                stats
            };
        });

        const getNestedObject = (nestedObj, pathArr: string[]) => {
            return pathArr.reduce((obj, key) =>
                (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
        }

        function sortPlayers(a, b) {
            if (sortingKey) {
                if (getNestedObject(a, SORTERS[sortingKey].split('.')) > getNestedObject(b, SORTERS[sortingKey].split('.'))) return -1;
                if (getNestedObject(a, SORTERS[sortingKey].split('.')) < getNestedObject(b, SORTERS[sortingKey].split('.'))) return 1;
            }

            // If its a conquest and home star victory then sort by home stars first, then by total stars.
            const isHomeStarVictory = game.settings.general.mode === 'conquest' && game.settings.conquest.victoryCondition === 'homeStarPercentage';

            if (isHomeStarVictory) {
                if (a.stats.totalHomeStars > b.stats.totalHomeStars) return -1;
                if (a.stats.totalHomeStars < b.stats.totalHomeStars) return 1;
            }

            if (game.settings.general.mode === 'kingOfTheHill' && a.isKingOfTheHill !== b.isKingOfTheHill) {
                if (a.isKingOfTheHill) return -1;
                if (b.isKingOfTheHill) return 1;
            }

            // Sort by total stars descending
            if (a.stats.totalStars > b.stats.totalStars) return -1;
            if (a.stats.totalStars < b.stats.totalStars) return 1;

            // Then by total ships descending
            if (a.stats.totalShips > b.stats.totalShips) return -1;
            if (a.stats.totalShips < b.stats.totalShips) return 1;

            // Then by total carriers descending
            if (a.stats.totalCarriers > b.stats.totalCarriers) return -1;
            if (a.stats.totalCarriers < b.stats.totalCarriers) return 1;

            // Then by defeated date descending
            if (a.player.defeated && b.player.defeated) {
                if (moment(a.player.defeatedDate) > moment(b.player.defeatedDate)) return -1;
                if (moment(a.player.defeatedDate) < moment(b.player.defeatedDate)) return 1;
            }

            // Sort defeated players last.
            return (a.player.defeated === b.player.defeated) ? 0 : a.player.defeated ? 1 : -1;
        }

        // Sort the undefeated players first.
        let undefeatedLeaderboard = playerStats
            .filter(x => !x.player.defeated)
            .sort(sortPlayers);

        // Sort the defeated players next.
        let defeatedLeaderboard = playerStats
            .filter(x => x.player.defeated)
            .sort(sortPlayers);

        // Join both sorted arrays together to produce the leaderboard.
        let leaderboard = undefeatedLeaderboard.concat(defeatedLeaderboard);

        return {
            leaderboard,
            fullKey: sortingKey ? SORTERS[sortingKey] : null
        };
    }

    getGameLeaderboardPosition(game: Game, player: Player) {
        if (game.state.leaderboard == null) {
            return null;
        }

        return game.state.leaderboard.findIndex(l => l.toString() === player._id.toString()) + 1;
    }

    addGameRankings(game: Game, gameUsers: User[], leaderboard: LeaderboardPlayer[]): GameRankingResult {
        let result: GameRankingResult = {
            ranks: [],
            eloRating: null
        };

        let leaderboardPlayers = leaderboard.map(x => x.player);

        for (let i = 0; i < leaderboardPlayers.length; i++) {
            let player = leaderboardPlayers[i];

            let user = gameUsers.find(u => player.userId && u._id.toString() === player.userId.toString());

            // Double check user isn't deleted.
            if (!user) {
                continue;
            }

            // Add to rank:
            // (Number of players / 2) - index of leaderboard
            // But 1st place will receive rank equal to the total number of players.
            // So 1st place of 4 players will receive 4 rank
            // 2nd place will receive 1 rank (4 / 2 - 1)
            // 3rd place will receive 0 rank (4 / 2 - 2)
            // 4th place will receive -1 rank (4 / 2 - 3)

            let rankIncrease = 0;

            if (i == 0) {
                rankIncrease = leaderboard.length; // Note: Using leaderboard length as this includes ALL players (including afk)
            }
            else if (game.settings.general.awardRankTo === 'all') {
                rankIncrease = Math.round(leaderboard.length / 2 - i);
            }

            // For AFK players, do not award any positive rank
            // and make sure they are deducted at least 1 rank.
            if (player.afk) {
                rankIncrease = Math.min(rankIncrease, -1);
            }
            // However if they are active and they have
            // filled an AFK slot then reward the player.
            // Award extra rank (at least 0) and do not allow a decrease in rank.
            else if (player.hasFilledAfkSlot) {
                rankIncrease = Math.max(Math.round(rankIncrease * 1.5), 0);
            }

            // For special game modes, award x2 positive rank.
            if (rankIncrease > 0 && this.gameTypeService.isSpecialGameMode(game)) {
                rankIncrease *= 2;
            }
            
            // Apply any additional rank multiplier at the end.
            rankIncrease *= game.constants.player.rankRewardMultiplier;

            let currentRank = user.achievements.rank;
            let newRank = Math.max(user.achievements.rank + rankIncrease, 0); // Cannot go less than 0.

            user.achievements.rank = newRank;
            user.achievements.level = this.userLevelService.getByRankPoints(newRank).id;

            // Append the rank adjustment to the results.
            result.ranks.push({
                playerId: player._id,
                current: currentRank,
                new: newRank
            });
        }

        result.eloRating = this.addUserRatingCheck(game, gameUsers);

        return result;
    }

    incrementGameWinnerAchievements(game: Game, gameUsers: User[], winner: Player, awardCredits: boolean) {
        let user = gameUsers.find(u => winner.userId && u._id.toString() === winner.userId.toString());

        // Double check user isn't deleted.
        if (!user) {
            return;
        }

        user.achievements.victories++; // Increase the winner's victory count
        
        // Note: We don't really care if its official or not, award a badge for any 32p games.
        if (this.gameTypeService.is32PlayerGame(game)) {
            this.badgeService.awardBadgeForUserVictor32PlayerGame(user);
        }

        if (this.gameTypeService.isSpecialGameMode(game)) {
            this.badgeService.awardBadgeForUserVictorySpecialGame(user, game);
        }

        // Give the winner a galactic credit providing it isn't a 1v1.
        if (!this.gameTypeService.is1v1Game(game) && awardCredits) {
            user.credits++;
        }
    }

    addUserRatingCheck(game: Game, gameUsers: User[]): EloRatingChangeResult | null {
        if (!this.gameTypeService.is1v1Game(game)) {
            return null;
        }
        
        let winningPlayer: Player = game.galaxy.players.find(p => p._id.toString() === game.state.winner!.toString())!;
        let losingPlayer: Player = game.galaxy.players.find(p => p._id.toString() !== game.state.winner!.toString())!;

        let winningUser: User = gameUsers.find(u => winningPlayer.userId && u._id.toString() === winningPlayer.userId.toString())!;
        let losingUser: User = gameUsers.find(u => losingPlayer.userId && u._id.toString() === losingPlayer.userId.toString())!;

        let winningUserOldRating = 1200;
        let losingUserOldRating = 1200;

        if (winningUser) {
            winningUserOldRating = winningUser.achievements.eloRating || 1200;

            winningUser.achievements.victories1v1++;
        }

        if (losingUser) {
            losingUserOldRating = losingUser.achievements.eloRating || 1200;

            losingUser.achievements.defeated1v1++;
        }

        this.ratingService.recalculateEloRating(winningUser, losingUser, true);

        return {
            winner: {
                _id: winningPlayer._id,
                newRating: winningUser ? winningUser.achievements.eloRating! : 1200,
                oldRating: winningUserOldRating
            },
            loser: {
                _id: losingPlayer._id,
                newRating: losingUser ? losingUser.achievements.eloRating! : 1200,
                oldRating: losingUserOldRating
            }
        };
    }

    getGameWinner(game: Game, leaderboard: LeaderboardPlayer[]): Player | null {
        let isKingOfTheHillMode = this.gameTypeService.isKingOfTheHillMode(game);
        let isAllUndefeatedPlayersReadyToQuit = this.gameService.isAllUndefeatedPlayersReadyToQuit(game);

        if (isAllUndefeatedPlayersReadyToQuit) {
            if (isKingOfTheHillMode) {
                return this.playerService.getKingOfTheHillPlayer(game) || this.getFirstPlacePlayer(leaderboard);
            }

            return this.getFirstPlacePlayer(leaderboard);
        }

        if (this.gameTypeService.isConquestMode(game)) {
            let starWinner = this.getStarCountWinner(game, leaderboard);

            if (starWinner) {
                return starWinner;
            }
        }

        if (this.gameStateService.isCountingDownToEnd(game) && this.gameStateService.hasReachedCountdownEnd(game)) {
            if (isKingOfTheHillMode) {
                return this.playerService.getKingOfTheHillPlayer(game) || this.getFirstPlacePlayer(leaderboard);
            }

            return this.getFirstPlacePlayer(leaderboard);
        }

        let lastManStanding = this.getLastManStanding(game, leaderboard);

        if (lastManStanding) {
            return lastManStanding;
        }

        return null;
    }

    getStarCountWinner(game: Game, leaderboard: LeaderboardPlayer[]): Player | null {
        // There could be more than one player who has reached
        // the number of stars required at the same time.
        // In this case we pick the player who has the most ships.
        // If that's equal, then pick the player who has the most carriers.

        // If conquest and home star percentage then use the totalHomeStars as the sort
        // All other cases use totalStars
        let totalStarsKey = this.gameTypeService.isConquestMode(game)
            && game.settings.conquest.victoryCondition === 'homeStarPercentage' ? 'totalHomeStars' : 'totalStars';

        // Firstly, check if ANYONE has reached the star limit, if so we need to end the game.
        let starWinners = leaderboard.filter(p => p.stats[totalStarsKey] >= game.state.starsForVictory);

        // If someone has reached the star limit then pick the first player who is not defeated.
        if (starWinners.length) {
            return leaderboard.filter(p => !p.player.defeated).map(p => p.player)[0];
        }

        return null;
    }

    getLastManStanding(game: Game, leaderboard: LeaderboardPlayer[]): Player | null {
        let undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated);

        if (undefeatedPlayers.length === 1) {
            return undefeatedPlayers[0];
        }

        // If all players have been defeated somehow then pick the player
        // who is currently in first place.
        let defeatedPlayers = game.galaxy.players.filter(p => p.defeated);

        if (defeatedPlayers.length === game.settings.general.playerLimit) {
            return this.getFirstPlacePlayer(leaderboard);
        }

        // If the remaining players alive are all AI then pick the player in 1st.
        // Note: Don't include pseudo afk, only legit actual afk players.
        let undefeatedAI = undefeatedPlayers.filter(p => this.playerAfkService.isAIControlled(game, p, false));
        
        if (undefeatedAI.length === undefeatedPlayers.length) {
            return this.getFirstPlacePlayer(leaderboard);
        }

        return null;
    }

    getFirstPlacePlayer(leaderboard: LeaderboardPlayer[]): Player {
        return leaderboard[0].player;
    }

    markNonAFKPlayersAsEstablishedPlayers(game: Game, gameUsers: User[]) {
        // Any player who isn't afk in an NPG is now considered an established player.
        for (let player of game.galaxy.players) {
            let user = gameUsers.find(u => player.userId && u._id.toString() === player.userId.toString());

            if (!user) {
                continue;
            }

            if (!player.afk) {
                user.isEstablishedPlayer = true;
            }
        }
    }

    incrementPlayersCompletedAchievement(game: Game, gameUsers: User[]) {
        for (let player of game.galaxy.players.filter(p => !p.defeated && !p.afk)) {
            let user = gameUsers.find(u => player.userId && u._id.toString() === player.userId.toString());

            if (!user) {
                continue;
            }

            user.achievements.completed++;
        }
    }

};
