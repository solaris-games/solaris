const EventEmitter = require('events');
const moment = require('moment');
const ValidationError = require('../errors/validation');

module.exports = class GameService extends EventEmitter {

    constructor(gameModel, userService, carrierService, playerService) {
        super();
        
        this.gameModel = gameModel;
        this.userService = userService;
        this.carrierService = carrierService;
        this.playerService = playerService;
    }

    async getByIdAll(id) {
        return await this.gameModel.findById(id).exec();
    }

    async getById(id, select) {
        return await this.gameModel.findById(id)
            .select(select)
            .exec();
    }

    async getByIdGalaxy(id, select) {
        return await this.getById(id, {
            settings: 1,
            state: 1,
            galaxy: 1,
            constants: 1
        });
    }

    async getByIdInfo(id) {
        return await this.getById(id, {
            settings: 1,
            state: 1
        });
    }

    async getByIdMessages(id) {
        return await this.getById(id, {
            settings: 1,
            state: 1,
            messages: 1,
            'galaxy.players': 1
        });
    }

    async join(game, userId, playerId, alias) {
        // Only allow join if the game hasn't started.
        if (game.state.startDate) {
            throw new ValidationError('The game has already started.');
        }

        // Only allow join if the game hasn't finished.
        if (game.state.endDate) {
            throw new ValidationError('The game has already finished.');
        }

        if (game.quitters.find(x => x.equals(userId))) {
            throw new ValidationError('You cannot rejoin this game.');
        }

        // Disallow if they are already in the game as another player.
        let existing = game.galaxy.players.find(x => x.userId === userId);

        if (existing) {
            throw new ValidationError('The user is already participating in this game.');
        }

        // Get the player and update it to assign the user to the player.
        let player = game.galaxy.players.find(x => x._id.toString() === playerId);

        if (!player) {
            throw new ValidationError('The player is not participating in this game.');
        }

        // Only allow if the player isn't already occupied.
        if (player && player.userId) {
            throw new ValidationError('This player spot has already been taken by another user.');
        }

        // TODO: Factor in player type setting. i.e premium players only.

        // Assign the user to the player.
        player.userId = userId;
        player.alias = alias;

        // If the max player count is reached then start the game.
        game.state.players = game.galaxy.players.filter(p => p.userId).length;

        let gameIsFull = game.state.players === game.settings.general.playerLimit;

        if (gameIsFull) {
            let start = moment().utc();

            // Add the start delay to the start date.
            start.add(game.settings.gameTime.startDelay, 'minute');

            game.state.paused = false;
            game.state.startDate = start;
            game.state.lastTickDate = start;
        }

        await game.save();

        let user = await this.getPlayerUser(game, player.id);
        user.achievements.joined++;
        await user.save();

        this.emit('onPlayerJoined', {
            game,
            player
        });

        if (gameIsFull) {
            this.emit('onGameStarted', {
                game
            });
        }
    }

    async quit(game, player) {    
        if (game.state.startDate) {
            throw new ValidationError('Cannot quit a game that has started.');
        }

        if (game.state.endDate) {
            throw new ValidationError('Cannot quit a game that has finished.');
        }
        
        let user = await this.userService.getById(player.userId);

        let alias = player.alias;

        game.quitters.push(player.userId); // Keep a log of players who have quit the game early so they cannot rejoin later.

        user.achievements.quit++;

        // Reset everything the player may have done to their empire.
        // This is to prevent the next player joining this slot from being screwed over.
        this.playerService.resetPlayerForGameStart(game, player);

        game.state.players = game.galaxy.players.filter(p => p.userId).length;

        await game.save();
        await user.save();

        this.emit('onPlayerQuit', {
            game,
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

        player.defeated = true;
        game.state.players--; // Deduct number of active players from the game.

        // NOTE: The game will check for a winner on each tick so no need to 
        // repeat that here.
        
        // Remove all carrier waypoints (unless in transit)
        this.carrierService.clearPlayerCarrierWaypointsNonTransit(game, player);

        let userPlayer = await this.getPlayerUser(game, player.id);
        userPlayer.achievements.defeated++;
        await userPlayer.save();

        this.emit('onPlayerDefeated', {
            game,
            player
        });
    }

    async getPlayerUser(game, playerId) {
        let player = game.galaxy.players.find(p => p.id === playerId);

        return await this.userService.getInfoById(player.userId);
    }

    isInProgress(game) {
        return game.state.startDate && !game.state.endDate;
    }

    isStarted(game) {
        return game.state.startDate != null;
    }

    isFinished(game) {
        return game.state.endDate != null;
    }

    finishGame(game, winnerPlayer) {
        game.state.paused = true;
        game.state.endDate = moment().utc();
        game.state.winner = winnerPlayer._id;
    }

};
