import moment from "moment";
import CarrierService from "../services/carrier";
import GameStateService from "../services/gameState";
import GameTypeService from "../services/gameType";
import PlayerService from "../services/player";
import PlayerAfkService from "../services/playerAfk"
import Repository from "../services/repository";
import StarService from "../services/star";
import { Game } from "../services/types/Game";
import { Player } from "../services/types/Player";
import mongoose from 'mongoose';

describe('Player AFK Service', () => {
    let service: PlayerAfkService;

    let game: Game;
    let player: Player;
    let gameRepo: Repository<Game>;
    let playerService: PlayerService;
    let starService: StarService;
    let carrierService: CarrierService;
    let gameTypeService: GameTypeService;
    let gameStateService: GameStateService;

    beforeEach(() => {
        gameStateService = {
            isStarted(game: Game) {
                return true;
            }
        } as GameStateService;

        gameTypeService = {
            isTurnBasedGame(game: Game) {
                return false;
            }
        } as GameTypeService;

        game = {
            state: {
                startDate: moment().utc().toDate()
            },
            settings: {
                galaxy: {
                    productionTicks: 20
                },
                gameTime: {
                    speed: 1800,
                    afk: {
                        lastSeenTimeout: 2,
                        turnTimeout: 3,
                        cycleTimeout: 4
                    }
                }
            }
        } as Game;

        player = {
            defeated: false,
            afk: false,
            userId: new mongoose.Types.ObjectId(),
            lastSeen: null
        } as Player;

        // @ts-ignore
        service = new PlayerAfkService(gameRepo, playerService, starService, carrierService, gameTypeService, gameStateService);
    });

    describe('Is AI Controlled', () => {
        it('should return true if the player is defeated', () => {
            player.defeated = true;
            player.userId = new mongoose.Types.ObjectId();

            const result = service.isAIControlled(game, player, false);
    
            expect(result).toBeTrue();
        });

        it('should return true if the player is not controlled by a user', () => {
            player.defeated = false;
            player.userId = null;

            const result = service.isAIControlled(game, player, false);
    
            expect(result).toBeTrue();
        });

        it('should return false if the player is controlled by a user and is not defeated', () => {
            player.defeated = false;
            player.userId = new mongoose.Types.ObjectId();

            const result = service.isAIControlled(game, player, false);
    
            expect(result).toBeFalse();
        });
    });

    describe('Pseudo AFK', () => {
        it('should return false if the game has not started yet', () => {
            gameStateService.isStarted = (game: Game) => {
                return false;
            };

            game.state.startDate = null;
    
            const result = service.isPsuedoAfk(game, player);
    
            expect(result).toBeFalse();
        });
    
        it('should return false if the game has not been playing for 12 hours', () => {
            const result = service.isPsuedoAfk(game, player);
    
            expect(result).toBeFalse();
        });
    
        it('should return true if the player has not been seen at all', () => {
            game.state.startDate = moment().utc().subtract(1, 'day').toDate();
    
            player.lastSeen = null;
            
            const result = service.isPsuedoAfk(game, player);
    
            expect(result).toBeTrue();
        });
    
        it('should return true if the player has not been seen since the start of the game', () => {
            game.state.startDate = moment().utc().subtract(1, 'day').toDate();
            
            player.lastSeen = game.state.startDate;
            
            const result = service.isPsuedoAfk(game, player);
    
            expect(result).toBeTrue();
        });
    
        it('should return true if the player has not been seen since before the start of the game', () => {
            game.state.startDate = moment().utc().subtract(1, 'day').toDate();
            
            player.lastSeen = moment().utc().subtract(2, 'days').toDate();
            
            const result = service.isPsuedoAfk(game, player);
    
            expect(result).toBeTrue();
        });
    
        it('should return false if the player has been seen since the start of the game', () => {
            game.state.startDate = moment().utc().subtract(1, 'day').toDate();
            
            player.lastSeen = moment().utc().toDate();
            
            const result = service.isPsuedoAfk(game, player);
    
            expect(result).toBeFalse();
        });
    });

    describe('Is AFK', () => {
        it('should return true if the player is already afk', () => {
            player.afk = true;
            
            const result = service.isAfk(game, player);
    
            expect(result).toBeTrue();
        });

        it('should return true if the player has not been seen for the last seen timeout', () => {
            player.lastSeen = moment().utc().subtract(game.settings.gameTime.afk.lastSeenTimeout, 'days').toDate();
            
            const result = service.isAfk(game, player);
    
            expect(result).toBeTrue();
        });

        it('should return true if the player has missed too many turns', () => {
            gameTypeService.isTurnBasedGame = (game: Game) => { return true; };

            player.lastSeen = moment().utc().toDate();
            player.missedTurns = game.settings.gameTime.afk.turnTimeout;
            
            const result = service.isAfk(game, player);

            expect(result).toBeTrue();
        });

        it('should return true if the player has missed too many cycles', () => {
            const seconds = game.settings.galaxy.productionTicks * game.settings.gameTime.speed * game.settings.gameTime.afk.cycleTimeout;

            player.lastSeen = moment().utc().subtract(seconds, 'seconds').toDate();
            
            const result = service.isAfk(game, player);

            expect(result).toBeTrue();
        });

        it('should return false if the player has missed too many cycles but seen less than 12h ago', () => {
            game.settings.galaxy.productionTicks = 1;
            game.settings.gameTime.speed = 30;
            game.settings.gameTime.afk.cycleTimeout = 1;

            const seconds = game.settings.galaxy.productionTicks * game.settings.gameTime.speed * game.settings.gameTime.afk.cycleTimeout;

            player.lastSeen = moment().utc().subtract(seconds, 'seconds').toDate();
            
            const result = service.isAfk(game, player);

            expect(result).toBeFalse();
        });
    });
});
