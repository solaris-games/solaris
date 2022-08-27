const EventEmitter = require('events');
import { DBObjectId } from './types/DBObjectId';
import ValidationError from '../errors/validation';
import Repository from './repository';
import { Game } from './types/Game';
import { Player } from './types/Player';
import AchievementService from './achievement';
import AvatarService from './avatar';
import CarrierService from './carrier';
import GameStateService from './gameState';
import GameTypeService from './gameType';
import PasswordService from './password';
import PlayerService from './player';
import StarService from './star';
import UserService from './user';
import ConversationService from './conversation';
import PlayerReadyService from './playerReady';
import GamePlayerQuitEvent from './types/events/GamePlayerQuit';
import GamePlayerDefeatedEvent from './types/events/GamePlayerDefeated';

export const GameServiceEvents = {
    onPlayerQuit: 'onPlayerQuit',
    onPlayerDefeated: 'onPlayerDefeated',
    onGameDeleted: 'onGameDeleted'
}

export default class GameService extends EventEmitter {
    gameRepo: Repository<Game>;
    userService: UserService;
    starService: StarService;
    carrierService: CarrierService;
    playerService: PlayerService;
    passwordService: PasswordService;
    achievementService: AchievementService;
    avatarService: AvatarService;
    gameTypeService: GameTypeService;
    gameStateService: GameStateService;
    conversationService: ConversationService;
    playerReadyService: PlayerReadyService;

    constructor(
        gameRepo: Repository<Game>,
        userService: UserService,
        starService: StarService,
        carrierService: CarrierService,
        playerService: PlayerService,
        passwordService: PasswordService,
        achievementService: AchievementService,
        avatarService: AvatarService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        conversationService: ConversationService,
        playerReadyService: PlayerReadyService
    ) {
        super();
        
        this.gameRepo = gameRepo;
        this.userService = userService;
        this.starService = starService;
        this.carrierService = carrierService;
        this.playerService = playerService;
        this.passwordService = passwordService;
        this.achievementService = achievementService;
        this.avatarService = avatarService;
        this.gameTypeService = gameTypeService;
        this.gameStateService = gameStateService;
        this.conversationService = conversationService;
        this.playerReadyService = playerReadyService;
    }

    async getByIdAll(id: DBObjectId): Promise<Game | null> {
        return await this.gameRepo.findByIdAsModel(id);
    }

    async getByIdAllLean(id: DBObjectId): Promise<Game | null> {
        return await this.gameRepo.findById(id);
    }

    async getById(id: DBObjectId, select?: any): Promise<Game | null> {
        return await this.gameRepo.findByIdAsModel(id, select);
    }

    async getByNameStateSettingsLean(name: string) {
        return await this.gameRepo.find({
            'settings.general.name': name
        }, {
            state: 1,
            settings: 1
        });
    }

    async getByIdSettingsLean(id: DBObjectId) {
        return await this.gameRepo.findById(id, {
            'settings': 1
        });
    }

    async getByIdLean(id: DBObjectId, select): Promise<Game | null> {
        return await this.gameRepo.findById(id, select);
    }

    async getByIdGalaxyLean(id: DBObjectId): Promise<Game | null> {
        return await this.getByIdLean(id, {
            settings: 1,
            state: 1,
            galaxy: 1,
            constants: 1,
            spectators: 1
        });
    }

    async getGameStateTick(id: DBObjectId) {
        let game = await this.getByIdLean(id, {
            'state.tick': 1
        });

        if (!game) {
            return null;
        }

        return game.state.tick;
    }

    async getGameSettings(id: DBObjectId) {
        let game = await this.getByIdLean(id, {
            'settings': 1
        });

        return game?.settings;
    }

    async quit(game: Game, player: Player) {    
        if (game.state.startDate) {
            throw new ValidationError('Cannot quit a game that has started.');
        }

        if (game.state.endDate) {
            throw new ValidationError('Cannot quit a game that has finished.');
        }

        // If its a tutorial game then straight up delete it.
        if (this.gameTypeService.isTutorialGame(game)) {
            await this.delete(game);

            return null;
        }
        
        let alias = player.alias;

        if (player.userId && !this.gameTypeService.isNewPlayerGame(game)) {
            game.quitters.push(player.userId); // Keep a log of players who have quit the game early so they cannot rejoin later.
        }

        if (player.userId && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementQuit(player.userId);
        }

        // Reset everything the player may have done to their empire.
        // This is to prevent the next player joining this slot from being screwed over.
        this.playerService.resetPlayerForGameStart(game, player);

        this.gameStateService.updateStatePlayerCount(game);
        
        await game.save();

        let e: GamePlayerQuitEvent = {
            gameId: game._id,
            gameTick: game.state.tick,
            playerId: player._id,
            playerAlias: alias
        };

        this.emit(GameServiceEvents.onPlayerQuit, e);

        return player;
    }

    async concedeDefeat(game: Game, player: Player, openSlot: boolean) {
        if (player.defeated) {
            throw new ValidationError('The player has already been defeated.');
        }

        if (!game.state.startDate) {
            throw new ValidationError('Cannot concede defeat in a game that has not yet started.');
        }

        if (game.state.endDate) {
            throw new ValidationError('Cannot concede defeat in a game that has finished.');
        }

        // If its a tutorial game then straight up delete it.
        if (this.gameTypeService.isTutorialGame(game)) {
            return this.delete(game);
        }

        game.quitters.push(player.userId!); // We need to track this to ensure that they don't try to rejoin in another open slot.

        this.playerService.setPlayerAsDefeated(game, player, openSlot);

        game.state.players--; // Deduct number of active players from the game.

        // NOTE: The game will check for a winner on each tick so no need to 
        // repeat that here.

        // TODO: This is temporary. The advanced AI will be able to handle this.
        // In the meantime, if we're still using normal AI we should clear looped carriers.
        // TODO: Remove when basic AI is removed.
        if (game.settings.general.advancedAI === 'disabled') {
            this.carrierService.clearPlayerCarrierWaypointsLooped(game, player);
        }

        if (player.userId && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementDefeated(player.userId, 1);
        }

        await game.save();

        let e: GamePlayerDefeatedEvent = {
            gameId: game._id,
            gameTick: game.state.tick,
            playerId: player._id,
            playerAlias: player.alias,
            openSlot
        };

        this.emit(GameServiceEvents.onPlayerDefeated, e);
    }

    async delete(game: Game, deletedByUserId?: DBObjectId) {
        // If being deleted by a legit user then do some validation.
        if (deletedByUserId && game.state.startDate) {
            throw new ValidationError('Cannot delete games that are in progress or completed.');
        }

        if (deletedByUserId && game.settings.general.createdByUserId && game.settings.general.createdByUserId.toString() !== deletedByUserId.toString()) {
            throw new ValidationError('Cannot delete this game, you did not create it.');
        }

        // If the game hasn't started yet, re-adjust user achievements of players
        // who joined the game.
        if (game.state.startDate == null && !this.gameTypeService.isTutorialGame(game)) {
            // Deduct "joined" count for all players who already joined the game.
            for (let player of game.galaxy.players) {
                if (player.userId) {
                    await this.achievementService.incrementJoined(player.userId, -1);
                }
            }
        }

        await this.gameRepo.deleteOne({ 
            _id: game._id 
        });

        this.emit(GameServiceEvents.onGameDeleted, {
            gameId: game._id
        });

        // TODO: Cleanup any orphaned docs
    }

    async getPlayerUser(game: Game, playerId: DBObjectId) {
        if (this.gameTypeService.isAnonymousGame(game)) {
            return null;
        }
        
        let player = game.galaxy.players.find(p => p._id.toString() === playerId.toString())!;

        return await this.userService.getInfoByIdLean(player.userId!, {
            'achievements.level': 1,
            'achievements.rank': 1,
            'achievements.renown': 1,
            'achievements.victories': 1,
            'achievements.eloRating': 1,
            roles: 1
        });
    }

    // TODO: Move to a gameLockService
    async lock(gameId: DBObjectId, locked: boolean = true) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            $set: {
                'state.locked': locked
            }
        });
    }

    // TODO: Move to a gameLockService
    async lockAll(locked: boolean = true) {
        await this.gameRepo.updateMany({
            'state.locked': { $ne: locked }
        }, {
            $set: {
                'state.locked': locked
            }
        });
    }

    listAllUndefeatedPlayers(game: Game) {
        if (this.gameTypeService.isTutorialGame(game)) {
            return game.galaxy.players.filter(p => p.userId);
        }

        return game.galaxy.players.filter(p => !p.defeated);
    }

    isAllUndefeatedPlayersReady(game: Game) {
        let undefeatedPlayers = this.listAllUndefeatedPlayers(game);

        return undefeatedPlayers.filter(x => x.ready).length === undefeatedPlayers.length;
    }

    isAllUndefeatedPlayersReadyToQuit(game: Game) {
        let undefeatedPlayers = this.listAllUndefeatedPlayers(game);

        return undefeatedPlayers.filter(x => x.readyToQuit).length === undefeatedPlayers.length;
    }

    async forceEndGame(game: Game) {
        let undefeatedPlayers = this.listAllUndefeatedPlayers(game);

        for (let player of undefeatedPlayers) {
            await this.playerReadyService.declareReadyToQuit(game, player, true);
        }
    }
    
    // TODO: Should be in a player service?
    async quitAllActiveGames(userId: DBObjectId) {
        let allGames = await this.gameRepo.findAsModels({
            'galaxy.players': {
                $elemMatch: { 
                    userId,             // User is in game
                    defeated: false     // User has not been defeated
                }
            },
            $and: [
                { 'state.endDate': { $eq: null } } // The game hasn't ended.
            ]
        });

        // Find all games that are pending start and quit.
        // Find all games that are active and admit defeat.
        for (let game of allGames) {
            let player = this.playerService.getByUserId(game, userId)!;

            if (this.gameStateService.isInProgress(game)) {
                await this.concedeDefeat(game, player, false);
            }
            else {
                await this.quit(game, player);
            }
        }
    }

    async markAsCleaned(gameId: DBObjectId) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            $set: {
                'state.cleaned': true,
                'settings.general.timeMachine': 'disabled'
            }
        });
    }

};
