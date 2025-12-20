import {Game, Team} from "./types/Game";
import {PlayerLeaderboard, LeaderboardPlayer, TeamLeaderboard, LeaderboardTeam, PlayerStatistics} from "./types/Leaderboard";
import { Player } from "./types/Player";
import {EloRatingChangeResult, GameRanking, GameRankingResult} from "solaris-common";
import { User } from "./types/User";
import BadgeService from "./badge";
import GameService from "./game";
import GameStateService from "./gameState";
import { GameTypeService } from 'solaris-common'
import PlayerService from "./player";
import PlayerStatisticsService from "./playerStatistics";
import RatingService from "./rating";
import PlayerAfkService from "./playerAfk";
import UserLevelService from "./userLevel";
import { reverseSort, sorterByProperty} from "solaris-common";
import TeamService from "./team";
import {DBObjectId} from "./types/DBObjectId";
import {isSpecialGameMode} from "./officialGames";

import moment from "moment";

export enum GameWinnerKind {
    Player = 'player',
    Team = 'team'
}

export type GameWinnerPlayer = {
    kind: GameWinnerKind.Player,
    player: Player
}

export type GameWinnerTeam = {
    kind: GameWinnerKind.Team,
    team: Team
}

export type GameWinner = GameWinnerPlayer | GameWinnerTeam;

const playerWinner = (player: Player): GameWinner => {
    return {
        kind: GameWinnerKind.Player,
        player
    };
}

const teamWinner = (team: Team): GameWinner => {
    return  {
        kind: GameWinnerKind.Team,
        team
    }
}

type PlayerAndStats = {
    player: Player,
    isKingOfTheHill: boolean,
    stats: PlayerStatistics,
}

export default class LeaderboardService {
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

    playerService: PlayerService;
    playerAfkService: PlayerAfkService;
    userLevelService: UserLevelService;
    ratingService: RatingService;
    gameService: GameService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    badgeService: BadgeService;
    playerStatisticsService: PlayerStatisticsService;
    teamService: TeamService;

    constructor(
        playerService: PlayerService,
        playerAfkService: PlayerAfkService,
        userLevelService: UserLevelService,
        ratingService: RatingService,
        gameService: GameService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        badgeService: BadgeService,
        playerStatisticsService: PlayerStatisticsService,
        teamService: TeamService
    ) {
        this.playerService = playerService;
        this.playerAfkService = playerAfkService;
        this.userLevelService = userLevelService;
        this.ratingService = ratingService;
        this.gameService = gameService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.badgeService = badgeService;
        this.playerStatisticsService = playerStatisticsService;
        this.teamService = teamService;
    }

    getGameLeaderboard(game: Game, sortingKey?: string): PlayerLeaderboard {
        const SORTERS = LeaderboardService.LOCALSORTERS;

        let kingOfTheHillPlayer: Player | null = null;

        if (this.gameTypeService.isKingOfTheHillMode(game)) {
            kingOfTheHillPlayer = this.playerService.getKingOfTheHillPlayer(game);
        }

        const playerStats = game.galaxy.players.map(p => {
            const isKingOfTheHill = kingOfTheHillPlayer != null && p._id.toString() === kingOfTheHillPlayer._id.toString();
            const stats = p.stats ?? this.playerStatisticsService.getStats(game, p);

            const playerAndStats: PlayerAndStats = {
                player: p,
                isKingOfTheHill,
                stats
            };

            return playerAndStats;
        });

        const getNestedObject = (nestedObj, pathArr: string[]) => {
            return pathArr.reduce((obj, key) =>
                (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
        }

        function sortPlayers(a: PlayerAndStats, b: PlayerAndStats) {
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
        const undefeatedLeaderboard = playerStats
            .filter(x => !x.player.defeated)
            .sort(sortPlayers);

        // Sort the defeated players next.
        const defeatedLeaderboard = playerStats
            .filter(x => x.player.defeated)
            .sort(sortPlayers);

        // Join both sorted arrays together to produce the leaderboard.
        const leaderboard = undefeatedLeaderboard.concat(defeatedLeaderboard);

        return {
            leaderboard,
            fullKey: sortingKey ? SORTERS[sortingKey] : null
        };
    }

    getTeamLeaderboardPosition(game: Game, player: Player) {
        if (game.state.teamLeaderboard == null) {
            return null;
        }

        const teamDefeated = (teamId: DBObjectId) => {
            const team = this.teamService.getById(game, teamId);

            if (!team) {
                return false;
            }

            return team.players.every(pId => {
                const player = this.playerService.getById(game, pId);
                return player && player.defeated;
            });
        }

        const playerId = player._id.toString();

        return game.state.teamLeaderboard.filter(t => !teamDefeated(t)).findIndex(tId => {
            const team = this.teamService.getById(game, tId);

            return team && team.players.find(pId => pId.toString() === playerId);
        }) + 1;
    }

    getGameLeaderboardPosition(game: Game, player: Player) {
        if (game.state.leaderboard == null) {
            return null;
        }

        const playerDefeated = (pId: DBObjectId) => {
            const player = this.playerService.getById(game, pId);
            return player && player.defeated;
        }

        return game.state.leaderboard.filter(pId => !playerDefeated(pId)).findIndex(l => l.toString() === player._id.toString()) + 1;
    }

    getTeamLeaderboard(game: Game): TeamLeaderboard | null {
        if (!this.gameTypeService.isTeamConquestGame(game) || !game.galaxy.teams) {
            return null;
        }

        const leaderboard = game.galaxy.teams.map(t => {
            let starCount = 0;
            let capitalCount = 0;

            for (const pId of t.players) {
                const player = this.playerService.getById(game, pId);

                if (!player) {
                    continue;
                }

                const stats = player.stats || this.playerStatisticsService.getStats(game, player);
                starCount += stats.totalStars;
                capitalCount += stats.totalHomeStars;
            }

            return {
                team: t,
                starCount,
                capitalCount
            }
        });

        const sorterProperty = game.settings.conquest.victoryCondition === 'homeStarPercentage' ? 'capitalCount' : 'starCount';
        leaderboard.sort(reverseSort(sorterByProperty(sorterProperty)));

        return {
            leaderboard
        };
    }

    addTeamRankings(game: Game, gameUsers: User[], leaderboard: LeaderboardTeam[]): GameRankingResult<DBObjectId> {
        // Get first team that is not defeated
        const leadingTeam = leaderboard.find(team => {
            return team.team.players.map(pId => this.playerService.getById(game, pId)!).filter(p => !p.defeated).length > 0;
        });

        if (!leadingTeam) {
            return {
                ranks: [],
                eloRating: null
            };
        }

        const nonAfkInLeadingTeam = leadingTeam.team.players
            .flatMap(pId => {
                const player = this.playerService.getById(game, pId);
                if (player && !player.afk) {
                    return [player];
                } else {
                    return [];
                }
            });

        const rankToAward = game.settings.general.playerLimit * 2;
        const rankPerPlayer = Math.floor(rankToAward / nonAfkInLeadingTeam.length);

        const ranks: GameRanking<DBObjectId>[] = [];

        for (let player of nonAfkInLeadingTeam) {
            const user = gameUsers.find(u => player.userId && u._id.toString() === player.userId.toString());

            if (!user) {
                continue;
            }

            const rankIncrease = rankPerPlayer * game.constants.player.rankRewardMultiplier;
            const currentRank = user.achievements.rank;
            const newRank = currentRank + rankIncrease;

            user.achievements.rank = newRank;
            user.achievements.level = this.userLevelService.getByRankPoints(newRank).id;

            ranks.push({
                playerId: player._id,
                current: currentRank,
                new: newRank
            });
        }

        return {
            ranks,
            eloRating: null
        };
    }

    addGameRankings(game: Game, gameUsers: User[], leaderboard: LeaderboardPlayer[]): GameRankingResult<DBObjectId> {
        let result: GameRankingResult<DBObjectId> = {
            ranks: [],
            eloRating: null,
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
            } else {
                if (game.settings.general.awardRankTo === 'all') {
                    rankIncrease = Math.round(leaderboard.length / 2 - i);
                } else if (game.settings.general.awardRankTo === 'top_n') {
                    const topN = game.settings.general.awardRankToTopN || 1;
                    if (i < topN || i >= leaderboard.length - topN) {
                        rankIncrease = Math.round(leaderboard.length / 2 - i);
                    }
                }
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
            if (rankIncrease > 0 && isSpecialGameMode(game)) {
                rankIncrease *= 2;
            }
            
            // Apply any additional rank multiplier at the end. Rank losses are not as steep as rank gains.
            const rankRewardMultiplier = rankIncrease < 0 ? Math.min(1, game.constants.player.rankRewardMultiplier) : game.constants.player.rankRewardMultiplier;

            rankIncrease *= rankRewardMultiplier;

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
        const user = gameUsers.find(u => winner.userId && u._id.toString() === winner.userId.toString());

        // Double check user isn't deleted.
        if (!user) {
            return;
        }

        user.achievements.victories++; // Increase the winner's victory count
        
        // Note: We don't really care if its official or not, award a badge for any 32p games.
        if (this.gameTypeService.is32PlayerGame(game)) {
            this.badgeService.awardBadgeForUserVictor32PlayerGame(user, game);
        }

        if (isSpecialGameMode(game)) {
            this.badgeService.awardBadgeForUserVictorySpecialGame(user, game);
        }

        // Give the winner a galactic credit providing it isn't a 1v1.
        if (!this.gameTypeService.is1v1Game(game) && awardCredits) {
            user.credits++;
        }
    }

    addUserRatingCheck(game: Game, gameUsers: User[]): EloRatingChangeResult<DBObjectId> | null {
        if (!this.gameTypeService.is1v1Game(game)) {
            return null;
        }
        
        const winningPlayer: Player = game.galaxy.players.find(p => p._id.toString() === game.state.winner!.toString())!;
        const losingPlayer: Player = game.galaxy.players.find(p => p._id.toString() !== game.state.winner!.toString())!;

        const winningUser: User | undefined = gameUsers.find(u => winningPlayer.userId && u._id.toString() === winningPlayer.userId.toString());
        const losingUser: User | undefined = gameUsers.find(u => losingPlayer.userId && u._id.toString() === losingPlayer.userId.toString());

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

    getGameWinnerTeam(game: Game, leaderboard: LeaderboardTeam[]): GameWinner | null {
        let isAllUndefeatedPlayersReadyToQuit = this.gameService.isReadyToQuitImmediateEnd(game);

        const key = game.settings.conquest.victoryCondition === 'starPercentage' ? 'starCount' : 'capitalCount';
        leaderboard.sort(reverseSort(sorterByProperty(key)));

        if (isAllUndefeatedPlayersReadyToQuit) {
            return teamWinner(leaderboard[0].team);
        }

        if (this.gameStateService.isCountingDownToEnd(game) && this.gameStateService.hasReachedCountdownEnd(game)) {
            return teamWinner(leaderboard[0].team);
        }

        const winningTeams = leaderboard.filter(t => t[key] >= game.state.starsForVictory);

        if (winningTeams.length) {
            return teamWinner(winningTeams[0].team); // First team in array must have the highest count
        }

        const lastTeamStanding = this.getLastTeamStanding(game, leaderboard);

        if (lastTeamStanding) {
            return teamWinner(lastTeamStanding);
        }

        return null;
    }

    getGameWinner(game: Game, leaderboard: LeaderboardPlayer[]): GameWinner | null {
        const isKingOfTheHillMode = this.gameTypeService.isKingOfTheHillMode(game);
        const isAllUndefeatedPlayersReadyToQuit = this.gameService.isReadyToQuitImmediateEnd(game);

        if (isAllUndefeatedPlayersReadyToQuit) {
            if (isKingOfTheHillMode) {
                return playerWinner(this.playerService.getKingOfTheHillPlayer(game) || this.getFirstPlacePlayer(leaderboard));
            }

            return playerWinner(this.getFirstPlacePlayer(leaderboard));
        }

        if (this.gameTypeService.isConquestMode(game)) {
            let starWinner = this.getStarCountWinner(game, leaderboard);

            if (starWinner) {
                return playerWinner(starWinner);
            }
        }

        if (this.gameStateService.isCountingDownToEnd(game) && this.gameStateService.hasReachedCountdownEnd(game)) {
            if (isKingOfTheHillMode) {
                return playerWinner(this.playerService.getKingOfTheHillPlayer(game) || this.getFirstPlacePlayer(leaderboard));
            }

            return playerWinner(this.getFirstPlacePlayer(leaderboard));
        }

        let lastManStanding = this.getLastManStanding(game, leaderboard);

        if (lastManStanding) {
            return playerWinner(lastManStanding);
        }

        // TODO: Hardcoded limit to games, 10000 ticks?

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

    getLastTeamStanding(game: Game, leaderboard: LeaderboardTeam[]): Team | null {
        if (!game.galaxy.teams) {
            return null;
        }

        const undefeatedTeams = game.galaxy.teams.filter(t => {
            return t.players.some(pId => {
                const player = this.playerService.getById(game, pId);
                return player && !player.defeated;
            });
        });

        if (undefeatedTeams.length === 1) {
            return undefeatedTeams[0];
        }

        if (undefeatedTeams.length === 0) {
            return leaderboard[0].team;
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
