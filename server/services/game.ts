const EventEmitter = require('events');
const moment = require('moment');
import { DBObjectId } from '../types/DBObjectId';
import ValidationError from '../errors/validation';
import DatabaseRepository from '../models/DatabaseRepository';
import { Game } from '../types/Game';
import { Player } from '../types/Player';
import { User } from '../types/User';
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

export default class GameService extends EventEmitter {
    gameRepo: DatabaseRepository<Game>;
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

    constructor(
        gameRepo: DatabaseRepository<Game>,
        userService: UserService,
        starService: StarService,
        carrierService: CarrierService,
        playerService: PlayerService,
        passwordService: PasswordService,
        achievementService: AchievementService,
        avatarService: AvatarService,
        gameTypeService: GameTypeService,
        gameStateService: GameStateService,
        conversationService: ConversationService
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
    }

    async getByIdAll(id: DBObjectId) {
        return await this.gameRepo.findByIdAsModel(id);
    }

    async getByIdAllLean(id: DBObjectId) {
        return await this.gameRepo.findById(id);
    }

    async getById(id: DBObjectId, select?: any) {
        return await this.gameRepo.findByIdAsModel(id, select);
    }

    async getByNameSettingsLean(name: string) {
        return await this.gameRepo.find({
            'settings.general.name': name
        }, {
            'settings': 1
        });
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

    async getByIdLean(id: DBObjectId, select: any): Promise<Game | null> {
        return await this.gameRepo.findById(id, select);
    }

    async getByIdGalaxy(id: DBObjectId) {
        return await this.getById(id, {
            settings: 1,
            state: 1,
            galaxy: 1,
            constants: 1,
        });
    }

    async getByIdGalaxyLean(id: DBObjectId): Promise<Game | null> {
        return await this.getByIdLean(id, {
            settings: 1,
            state: 1,
            galaxy: 1,
            constants: 1
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

    async getGameState(id: DBObjectId) {
        let game = await this.getByIdLean(id, {
            'state': 1
        });

        return game?.state;
    }

    async getByIdInfo(id: DBObjectId, userId: DBObjectId) {
        let game = await this.getByIdLean(id, {
            settings: 1,
            state: 1,
            constants: 1
        });

        if (!game) {
            return null;
        }

        if (game.settings.general.createdByUserId) {
            game.settings.general.isGameAdmin = game.settings.general.createdByUserId.toString() === userId.toString();
        } else {
            game.settings.general.isGameAdmin = false;
        }

        return game;
    }

    async getByIdState(id: DBObjectId, userId: DBObjectId) {
        let game = await this.getByIdLean(id, {
            state: 1
        });

        return game;
    }

    async getByIdMessages(id: DBObjectId) {
        return await this.getById(id, {
            settings: 1,
            state: 1,
            messages: 1,
            'galaxy.players': 1
        });
    }

    async getByIdMessagesLean(id: DBObjectId) {
        return await this.getByIdLean(id, {
            settings: 1,
            state: 1,
            messages: 1,
            'galaxy.players': 1
        });
    }

    async getByIdConversations(id: DBObjectId) {
        return await this.getById(id, {
            state: 1,
            conversations: 1,
            'galaxy.players': 1
        });
    }

    async getByIdConversationsLean(id: DBObjectId) {
        return await this.getByIdLean(id, {
            state: 1,
            conversations: 1,
            'galaxy.players': 1
        });
    }

    async getByIdDiplomacyLean(id: DBObjectId) {
        return await this.getByIdLean(id, {
            'galaxy.players._id': 1,
            'galaxy.players.userId': 1,
            'galaxy.players.diplomacy': 1
        });
    }

    async join(game: Game, userId: DBObjectId, playerId: DBObjectId, alias: string, avatar: number, password: string) {
        // The player cannot join the game if:
        // 1. The game has finished.
        // 2. They quit the game before the game started.
        // 3. They are already playing the game as an undefeated non-afk player.
        // 4. They are trying to play in a different slot if they have been afk'd.
        // 5. The password entered is invalid.
        // 6. The player does not own any stars.
        // 7. The alias is already taken.
        // 8. The alias (username) is already taken.

        // Only allow join if the game hasn't finished.
        if (game.state.endDate) {
            throw new ValidationError('The game has already finished.');
        }

        if (game.settings.general.password) {
            let passwordMatch = await this.passwordService.compare(password, game.settings.general.password);

            if (!passwordMatch) {
                throw new ValidationError('The password is invalid.');
            }
        }

        // Perform a new player check if the game is for established players only.
        // If the player is new then they cannot join.

        if (this.gameTypeService.isForEstablishedPlayersOnly(game)) {
            const isEstablishedPlayer = await this.userService.isEstablishedPlayer(userId);
            
            // Disallow new players from joining non-new-player-games games if they haven't completed a game yet.
            if (!isEstablishedPlayer && !this.gameTypeService.isNewPlayerGame(game)) {
                throw new ValidationError('You must complete a "New Player" game or a custom game before you can join an official game.');
            }
        }

        // Verify that the user has purchased the avatar they selected.
        const userAvatar = await this.avatarService.getUserAvatar(userId, avatar);

        if (!userAvatar.purchased) {
            throw new ValidationError(`You have not purchased the selected avatar.`);
        }

        // The user cannot rejoin if they quit early.
        let isQuitter = game.quitters.find(x => x.toString() === userId.toString());

        if (isQuitter) {
            throw new ValidationError('You cannot rejoin this game.');
        }

        // Disallow if they are already in the game as another player.
        // If the player they are in the game as is afk then that's fine.
        let existing = game.galaxy.players.find(x => x.userId && x.userId.toString() === userId.toString());

        if (existing && !existing.afk) {
            throw new ValidationError('You are already participating in this game.');
        }

        // Get the player and update it to assign the user to the player.
        let player = game.galaxy.players.find(x => x._id.toString() === playerId.toString());

        if (!player) {
            throw new ValidationError('The player is not participating in this game.');
        }

        // If the user was an afk-er then they are only allowed to join
        // their slot.
        let isAfker = game.afkers.find(x => x.toString() === userId.toString());
        let isRejoiningAfkSlot = isAfker && player.afk && userId && player.userId && player.userId.toString() === userId.toString();

        // If they have been afk'd then they are only allowed to join their slot again.
        if (player.afk && isAfker && userId && player.userId && player.userId.toString() !== userId.toString()) {
            throw new ValidationError('You can only rejoin this game in your own slot.');
        }

        let stars = this.starService.listStarsOwnedByPlayer(game.galaxy.stars, player._id);

        if (!stars.length) {
            throw new ValidationError('Cannot fill this slot, the player does not own any stars.');
        }

        // Only allow if the player isn't already occupied and is afk
        // We want to allow players to join in-progress games to fill afk slots.
        if (player && player.userId && !player.afk) {
            throw new ValidationError('This player spot has already been taken by another user.');
        }

        let aliasCheckPlayer = game.galaxy.players.find(x => x.userId && x.alias.toLowerCase() === alias.toLowerCase());

        if (aliasCheckPlayer && !isRejoiningAfkSlot) {
            throw new ValidationError(`The alias '${alias}' has already been taken by another player.`);
        }

        // Disallow if they have the same alias as a user.
        let aliasCheckUser = await this.userService.otherUsernameExists(alias, userId);

        if (aliasCheckUser) {
            throw new ValidationError(`The alias '${alias}' is the username of another player.`);
        }

        // TODO: Factor in player type setting. i.e premium players only.

        let gameIsFull = this.assignPlayerToUser(game, player, userId, alias, avatar);

        await game.save();

        if (player.userId && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementJoined(player.userId);
        }

        this.emit('onPlayerJoined', {
            gameId: game._id,
            gameTick: game.state.tick,
            player
        });

        if (gameIsFull) {
            this.emit('onGameStarted', {
                gameId: game._id,
                gameTick: game.state.tick
            });
        }

        return gameIsFull; // Return whether the game is now full, the calling API endpoint can broadcast it.
    }

    assignPlayerToUser(game: Game, player: Player, userId: DBObjectId | null, alias: string, avatar: number) {
        let isAfker = userId && game.afkers.find(x => x.toString() === userId.toString()) != null;
        let isFillingAfkSlot = this.gameStateService.isInProgress(game) && player.afk;
        let isRejoiningOwnAfkSlot = isFillingAfkSlot && isAfker && (userId && player.userId && player.userId.toString() === userId.toString());
        let hasFilledOtherPlayerAfkSlot = isFillingAfkSlot && !isRejoiningOwnAfkSlot;

        // Assign the user to the player.
        player.userId = userId;
        player.alias = alias;
        player.avatar = avatar.toString();

        // Reset the defeated and afk status as the user may be filling
        // an afk slot.
        player.hasFilledAfkSlot = hasFilledOtherPlayerAfkSlot;
        player.defeated = false;
        player.defeatedDate = null;
        player.afk = false;
        player.missedTurns = 0;
        player.hasSentTurnReminder = false;

        if (!player.userId) {
            player.ready = true;
        }

        // If the max player count is reached then start the game.
        this.gameStateService.updateStatePlayerCount(game);
        
        let gameIsFull = false;

        // If the game hasn't started yet then check if the game is full
        if (!game.state.startDate) {
            gameIsFull = game.state.players === game.settings.general.playerLimit;
    
            if (gameIsFull) {
                let startDate = moment().utc();
    
                if (this.gameTypeService.isRealTimeGame(game)) {
                    // Add the start delay to the start date.
                    startDate.add(game.settings.gameTime.startDelay, 'minute');
                }
    
                game.state.paused = false;
                game.state.startDate = startDate;
                game.state.lastTickDate = startDate;
    
                for (let player of game.galaxy.players) {
                    this.playerService.updateLastSeen(game, player, startDate);
                }
            }
        } else {
            this.playerService.updateLastSeen(game, player);

            // If the player is joining another player's AFK slot, remove them
            // from any conversation that the other player was in.
            if (hasFilledOtherPlayerAfkSlot) {
                this.conversationService.leaveAll(game, player._id);
            }
        }

        return gameIsFull;
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

        this.emit('onPlayerQuit', {
            gameId: game._id,
            gameTick: game.state.tick,
            player,
            alias
        });

        return player;
    }

    async concedeDefeat(game: Game, player: Player) {
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

        this.playerService.setPlayerAsDefeated(game, player);

        game.state.players--; // Deduct number of active players from the game.

        // NOTE: The game will check for a winner on each tick so no need to 
        // repeat that here.
        
        // TODO: We may want to do this in future when the AI becomes clevererer.
        // // Remove all carrier waypoints (unless in transit)
        // this.carrierService.clearPlayerCarrierWaypointsNonTransit(game, player);
        // TODO: Instead of above, just clear the player's looped waypoints.
        this.carrierService.clearPlayerCarrierWaypointsLooped(game, player);

        if (player.userId && !this.gameTypeService.isTutorialGame(game)) {
            await this.achievementService.incrementDefeated(player.userId, 1);
        }

        await game.save();

        this.emit('onPlayerDefeated', {
            gameId: game._id,
            gameTick: game.state.tick,
            player
        });
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

        this.emit('onGameDeleted', {
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

    async forceAllUndefeatedPlayersReadyToQuit(game: Game) {
        let undefeatedPlayers = this.listAllUndefeatedPlayers(game);

        for (let player of undefeatedPlayers) {
            await this.playerService.declareReadyToQuit(game, player, true);
        }
    }
    
    // TODO: Should be in a player service?
    async quitAllActiveGames(userId: DBObjectId) {
        let allGames: any[] = await this.gameRepo.findAsModels({
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
            let player = this.playerService.getByUserId(game, userId);

            if (this.gameStateService.isInProgress(game)) {
                await this.concedeDefeat(game, player);
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
