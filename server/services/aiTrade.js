const TRADE_CHANCE_BASE = 50;
const TRADE_CHANCE_STEP = 5;
const TRADE_CHANCE_MIN_REPUTATION = 1;

module.exports = class AITradeService {

    constructor(reputationService, randomService, tradeService) {
        this.reputationService = reputationService;
        this.randomService = randomService;
        this.tradeService = tradeService;

        this.reputationService.on('onReputationIncreased', (args) => this.onReputationIncreased(args.game, args.player, args.forPlayer, args.amount));
    }

    async onReputationIncreased(game, fromPlayer, toPlayer, amount) {
        // Make sure the player is AI.
        if (!toPlayer.defeated) {
            return;
        }

        let reputation = this.reputationService.getReputation(game, toPlayer, fromPlayer);

        if (reputation.score < TRADE_CHANCE_MIN_REPUTATION) {
            return;
        }

        let tradeChance = TRADE_CHANCE_BASE + (TRADE_CHANCE_STEP * reputation.score);
        let tradeRoll = this.randomService.getRandomNumber(100);

        if (tradeRoll <= tradeChance) {
            await this._tryTrade(game, toPlayer, fromPlayer);
        }
    }

    async _tryTrade(game, player, toPlayer) {
        // TODO: Get the differences in tech levels between the two players that the AI can afford.
        // TODO: Pick a random tech(?) and send it to the player.
        // TODO: Consider scanning range trade setting.
        // TODO: Trade may need to be refactored first as it uses the old method of saving to DB.
    }

};
