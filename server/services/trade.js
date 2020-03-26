

module.exports = class TradeService {

    constructor(gameService) {
        this.gameService = gameService;
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

};
