import { Game } from '../services/types/Game';
import LeaderboardService from '../services/leaderboard';
import Repository from '../services/repository';
import { User } from '../services/types/User';
import UserService from '../services/user';
import PlayerService from '../services/player';
import UserGuildService from '../services/guildUser';
import RatingService from '../services/rating';
import GameService from '../services/game';
import { GameTypeService } from 'solaris-common'
import GameStateService from '../services/gameState';
import BadgeService from '../services/badge';
import PlayerStatisticsService from '../services/playerStatistics';
import { Player } from '../services/types/Player';
import { LeaderboardPlayer } from '../services/types/Leaderboard';
import PlayerAfkService from '../services/playerAfk';
import UserLevelService from '../services/userLevel';
import TeamService from "../services/team";
import mongoose from 'mongoose';

describe('Leaderboard - Last man standing', () => {
    let playerService: PlayerService;
    let playerAfkService: PlayerAfkService;
    let userLevelService: UserLevelService;
    let ratingService: RatingService;
    let gameService: GameService;
    let gameTypeService: GameTypeService;
    let gameStateService: GameStateService;
    let badgeService: BadgeService;
    let playerStatisticsService: PlayerStatisticsService;
    let teamService: TeamService;

    let service: LeaderboardService;
    let game: Game;
    let leaderboard: LeaderboardPlayer[];

    beforeEach(() => {
        teamService = {

        } as TeamService;
        playerAfkService = {
            isAIControlled: (game: Game, player: Player, includePseudoAfk: boolean) => {
                return false;
            }
        } as PlayerAfkService;

        gameTypeService = {
            isKingOfTheHillMode: (game: Game) => { return false; }
        } as GameTypeService;

        playerStatisticsService = {
            getStats: (game: Game, player: Player) => {
                return {
                    totalStars: 1,
                    totalHomeStars: 1,
                    totalCarriers: 1,
                    totalShips: 1,
                    totalEconomy: 1,
                    totalIndustry: 1,
                    totalScience: 1,
                    newShips: 1,
                    warpgates: 1,
                    totalStarSpecialists: 1,
                    totalCarrierSpecialists: 1,
                    totalSpecialists: 2
                };
            }
        } as PlayerStatisticsService;

        // @ts-ignore
        service = new LeaderboardService(playerService, playerAfkService, userLevelService, ratingService, gameService, gameTypeService, gameStateService, badgeService, playerStatisticsService, teamService);

        game = {
            settings: {
                general: {
                    playerLimit: 2
                }
            },
            galaxy: {
                players: [
                    {
                        _id: new mongoose.Types.ObjectId(),
                        userId: new mongoose.Types.ObjectId(),
                        defeated: false
                    },
                    {
                        _id: new mongoose.Types.ObjectId(),
                        userId: new mongoose.Types.ObjectId(),
                        defeated: false
                    },
                    {
                        _id: new mongoose.Types.ObjectId(),
                        userId: new mongoose.Types.ObjectId(),
                        defeated: false
                    }
                ]
            }
        } as Game;

        leaderboard = game.galaxy.players.map(p => {
            return {
                player: p,
                stats: playerStatisticsService.getStats(game, p),
                isKingOfTheHill: false
            }
        })
    });

    it('should return null if no players are defeated', () => {
        const result = service.getLastManStanding(game, leaderboard);

        expect(result).toBeNull();
    });

    it('should return the first player if all other players are defeated', () => {
        game.galaxy.players[1].defeated = true;
        game.galaxy.players[1].defeatedDate = new Date();
        game.galaxy.players[2].defeated = true;
        game.galaxy.players[2].defeatedDate = new Date();

        const result = service.getLastManStanding(game, leaderboard);

        expect(result).not.toBeNull();
        expect(result!._id).toBe(game.galaxy.players[0]._id!);
    });

    it('should return the first place player if all players are defeated', () => {
        game.galaxy.players[0].defeated = true;
        game.galaxy.players[0].defeatedDate = new Date();
        game.galaxy.players[1].defeated = true;
        game.galaxy.players[1].defeatedDate = new Date();
        game.galaxy.players[2].defeated = true;
        game.galaxy.players[2].defeatedDate = new Date();

        const result = service.getLastManStanding(game, leaderboard);

        expect(result).not.toBeNull();
        expect(result!._id).toBe(game.galaxy.players[0]._id!);
    });

    it('should return null if all other players are undefeated AI', () => {
        game.galaxy.players[1].userId = null;
        game.galaxy.players[2].userId = null;

        playerAfkService.isAIControlled = (game: Game, player: Player, includePseudoAfk: boolean) => { return player._id.toString() !== game.galaxy.players[0]._id.toString(); }

        const result = service.getLastManStanding(game, leaderboard);

        expect(result).toBeNull();
    });

    it('should return the first place player all players are AI', () => {
        game.galaxy.players[0].userId = null;
        game.galaxy.players[1].userId = null;
        game.galaxy.players[2].userId = null;

        playerAfkService.isAIControlled = (game: Game, player: Player, includePseudoAfk: boolean) => { return true; }

        const result = service.getLastManStanding(game, leaderboard);

        expect(result).not.toBeNull();
        expect(result!._id).toBe(game.galaxy.players[0]._id!);
    });
})