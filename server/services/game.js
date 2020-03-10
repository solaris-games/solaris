const moment = require('moment');

module.exports = class GameService {

    constructor(gameModel) {
        this.gameModel = gameModel;
    }

    async getById(id, select) {
        return await this.gameModel.findById(id)
            .select(select)
            .exec();
    }

    async getByIdAll(id) {
        return await this.getById(id, {});
    }

    async getByIdInfo(id) {
        return await this.getById(id, {
            settings: 1,
            state: 1
        });
    }

    async join(gameId, userId, playerId, alias) {
        let game = await this.getById(gameId, {});

        // Only allow join if the game hasn't started.
        if (game.state.startDate) {
            throw new Error('The game has already started.');
        }

        // Only allow join if the game hasn't finished.
        if (game.state.endDate) {
            throw new Error('The game has already finished.');
        }

        // Disallow if they are already in the game as another player.
        let existing = game.galaxy.players.find(x => x.userId === userId);

        if (existing) {
            throw new Error('The user is already participating in this game.');
        }

        // Get the player and update it to assign the user to the player.
        let player = game.galaxy.players.find(x => x._id.toString() === playerId);

        if (!player) {
            throw new Error('The player does not exist in this game.');
        }

        // Only allow if the player isn't already occupied.
        if (player && player.userId) {
            throw new Error('This player has already been taken by another user.');
        }

        // TODO: Factor in player type setting. i.e premium players only.

        // Assign the user to the player.
        player.userId = userId;
        player.alias = alias;

        // If the max player count is reached then start the game.
        game.state.playerCount++;

        if (game.state.playerCount === game.settings.general.playerLimit) {
            let start = moment();

            game.state.paused = false;
            game.state.startDate = start.toDate();
            game.state.lastTickDate = start.toDate();
            game.state.nextTickDate = start.add(10, 'm').toDate();
        }

        return await game.save();
    }

    async concedeDefeat(gameId, userId) {
        // Remove the player from the game.
        let game = this.getById(gameId, {});
    
        // TODO: Disallow if they have already been defeated.
        // TODO: General checks to ensure that the game hasn't finished
        //       or anything weird like that.

        // Get the player that is linked to this user.
        let player = game.galaxy.players.find(x => x.userId == userId);

        if (!player) {
            throw new Error('The user is not participating in this game.');
        }

        player.defeated = true;

        return await game.save();
    }

};
