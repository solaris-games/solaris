

module.exports = class TradeService {

    constructor(gameService, userService) {
        this.gameService = gameService;
        this.userService = userService;
    }

    async sendCredits(gameId, fromUserId, toPlayerId, amount) {
        let game = await this.gameService.getById(gameId);

        // Get the players.
        let fromPlayer = game.galaxy.players.find(x => x.userId === fromUserId);
        let toPlayer = game.galaxy.players.find(x => x.id === toPlayerId);

        if (fromPlayer.cash < amount) {
            throw new Error(`The player does not own ${amount} credits.`);
        }

        fromPlayer.cash -= amount;
        toPlayer.cash += amount;

        await game.save();
    }

    async sendRenown(gameId, fromUserId, toPlayerId, amount) {
        let game = await this.gameService.getById(gameId);

        // Get the players.
        let fromPlayer = game.galaxy.players.find(x => x.userId === fromUserId);
        let toPlayer = game.galaxy.players.find(x => x.id === toPlayerId);

        if (fromPlayer === toPlayer) {
            throw new Error(`Cannot award renown to yourself.`);
        }

        if (fromPlayer.renownToGive < amount) {
            throw new Error(`The player does not own ${amount} renown to award.`);
        }

        // Get the user of the player to award renown to.
        let toUser = await this.userService.getById(toPlayer.userId);

        fromPlayer.renownToGive -= amount;
        toUser.achievements.renown += amount;

        await game.save();
        await toUser.save();
    }

};
