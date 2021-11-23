const EventEmitter = require('events');
const moment = require('moment');
const ValidationError = require('../errors/validation');

module.exports = class GameService extends EventEmitter {

    constructor(gameRepo, userService, starService, carrierService, playerService, passwordService, achievementService, avatarService, gameTypeService, gameStateService) {
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
    }

    async getByIdAll(id) {
        return await this.gameRepo.findByIdAsModel(id);
    }

    async getByIdAllLean(id) {
        return await this.gameRepo.findById(id);
    }

    async getById(id, select) {
        return await this.gameRepo.findByIdAsModel(id, select);
    }

    async getByNameSettingsLean(name) {
        return await this.gameRepo.find({
            'settings.general.name': name
        }, {
            'settings': 1
        });
    }

    async getByNameStateSettingsLean(name) {
        return await this.gameRepo.find({
            'settings.general.name': name
        }, {
            state: 1,
            settings: 1
        });
    }

    async getByIdSettingsLean(id) {
        return await this.gameRepo.findById(id, {
            'settings': 1
        });
    }

    async getByIdLean(id, select) {
        return await this.gameRepo.findById(id, select);
    }

    async getByIdGalaxy(id, select) {
        return await this.getById(id, {
            settings: 1,
            state: 1,
            galaxy: 1,
            constants: 1,
        });
    }

    async getByIdGalaxyLean(id, select) {
        return await this.getByIdLean(id, {
            settings: 1,
            state: 1,
            galaxy: 1,
            constants: 1
        });
    }

    async getGameStateTick(id) {
        let game = await this.getByIdLean(id, {
            'state.tick': 1
        });

        if (!game) {
            return null;
        }

        return game.state.tick;
    }

    async getGameSettings(id) {
        let game = await this.getByIdLean(id, {
            'settings': 1
        });

        return game.settings;
    }

    async getGameState(id) {
        let game = await this.getByIdLean(id, {
            'state': 1
        });

        return game.state;
    }

    async getByIdInfo(id, userId) {
        let game = await this.getByIdLean(id, {
            settings: 1,
            state: 1,
            constants: 1
        });

        if (game.settings.general.createdByUserId) {
            game.settings.general.isGameAdmin = game.settings.general.createdByUserId.equals(userId);
        } else {
            game.settings.general.isGameAdmin = false;
        }

        return game;
    }

    async getByIdState(id, userId) {
        let game = await this.getByIdLean(id, {
            state: 1
        });

        return game;
    }

    async getByIdMessages(id) {
        return await this.getById(id, {
            settings: 1,
            state: 1,
            messages: 1,
            'galaxy.players': 1
        });
    }

    async getByIdMessagesLean(id) {
        return await this.getByIdLean(id, {
            settings: 1,
            state: 1,
            messages: 1,
            'galaxy.players': 1
        });
    }

    async getByIdConversations(id) {
        return await this.getById(id, {
            state: 1,
            conversations: 1,
            'galaxy.players': 1
        });
    }

    async getByIdConversationsLean(id) {
        return await this.getByIdLean(id, {
            state: 1,
            conversations: 1,
            'galaxy.players': 1
        });
    }

    async getByIdDiplomacyLean(id) {
        return await this.getByIdLean(id, {
            'galaxy.players._id': 1,
            'galaxy.players.userId': 1,
            'galaxy.players.diplomacy': 1
        });
    }

    async join(game, userId, playerId, alias, avatar, password) {
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
            let isEstablishedPlayer = await this.achievementService.isEstablishedPlayer(userId);
            
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
        let isQuitter = game.quitters.find(x => x.equals(userId));

        if (isQuitter) {
            throw new ValidationError('You cannot rejoin this game.');
        }

        // Disallow if they are already in the game as another player.
        // If the player they are in the game as is afk then that's fine.
        let existing = game.galaxy.players.find(x => x.userId === userId.toString());

        if (existing && !existing.afk) {
            throw new ValidationError('You are already participating in this game.');
        }

        // Get the player and update it to assign the user to the player.
        let player = game.galaxy.players.find(x => x._id.toString() === playerId);

        if (!player) {
            throw new ValidationError('The player is not participating in this game.');
        }

        // If the user was an afk-er then they are only allowed to join
        // their slot.
        let isAfker = game.afkers.find(x => x.equals(userId));
        let isRejoiningAfkSlot = isAfker && player.afk && player.userId === userId.toString();

        // If they have been afk'd then they are only allowed to join their slot again.
        if (player.afk && isAfker && player.userId !== userId.toString()) {
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

    assignPlayerToUser(game, player, userId, alias, avatar) {
        // Assign the user to the player.
        player.userId = userId;
        player.alias = alias;
        player.avatar = avatar;

        // Reset the defeated and afk status as the user may be filling
        // an afk slot.
        player.hasFilledAfkSlot = player.afk;
        player.defeated = false;
        player.defeatedDate = null;
        player.afk = false;
        player.ai = false;
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
        }

        return gameIsFull;
    }

    async quit(game, player) {    
        if (game.state.startDate) {
            throw new ValidationError('Cannot quit a game that has started.');
        }

        if (game.state.endDate) {
            throw new ValidationError('Cannot quit a game that has finished.');
        }

        // If its a tutorial game then straight up delete it.
        if (this.gameTypeService.isTutorialGame(game)) {
            return this.delete(game);
        }
        
        let alias = player.alias;

        if (!this.gameTypeService.isNewPlayerGame(game)) {
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

    async concedeDefeat(game, player) {
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

    async delete(game, deletedByUserId) {
        // If being deleted by a legit user then do some validation.
        if (deletedByUserId && game.state.startDate) {
            throw new ValidationError('Cannot delete games that are in progress or completed.');
        }

        if (deletedByUserId && !game.settings.general.createdByUserId.equals(deletedByUserId)) {
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

    async getPlayerUser(game, playerId) {
        let player = game.galaxy.players.find(p => p._id.toString() === playerId.toString());

        return await this.userService.getInfoById(player.userId);
    }

    async getPlayerUserLean(game, playerId) {
        if (this.gameTypeService.isAnonymousGame(game)) {
            return null;
        }
        
        let player = game.galaxy.players.find(p => p._id.toString() === playerId.toString());

        return await this.userService.getInfoByIdLean(player.userId, {
            'achievements.rank': 1,
            'achievements.renown': 1,
            'achievements.victories': 1,
            'achievements.eloRating': 1,
            roles: 1
        });
    }

    // TODO: Move to a gameLockService
    async lock(gameId, locked = true) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            $set: {
                'state.locked': locked
            }
        });
    }

    // TODO: Move to a gameLockService
    async lockAll(locked = true) {
        await this.gameRepo.updateMany({
            'state.locked': { $ne: locked }
        }, {
            $set: {
                'state.locked': locked
            }
        });
    }

    listAllUndefeatedPlayers(game) {
        if (this.gameTypeService.isTutorialGame(game)) {
            return game.galaxy.players.filter(p => p.userId);
        }

        return game.galaxy.players.filter(p => !p.defeated);
    }

    isAllUndefeatedPlayersReady(game) {
        let undefeatedPlayers = this.listAllUndefeatedPlayers(game);

        return undefeatedPlayers.filter(x => x.ready).length === undefeatedPlayers.length;
    }

    isAllUndefeatedPlayersReadyToQuit(game) {
        let undefeatedPlayers = this.listAllUndefeatedPlayers(game);

        return undefeatedPlayers.filter(x => x.readyToQuit).length === undefeatedPlayers.length;
    }
    
    // TODO: Should be in a player service?
    async quitAllActiveGames(userId) {
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
            let player = this.playerService.getByUserId(game, userId);

            if (this.gameStateService.isInProgress(game)) {
                await this.concedeDefeat(game, player);
            }
            else {
                await this.quit(game, player);
            }
        }
    }

    async markAsCleaned(gameId) {
        await this.gameRepo.updateOne({
            _id: gameId
        }, {
            $set: {
                'state.cleaned': true
            }
        });
    }

};
