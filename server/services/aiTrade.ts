const TRADE_CHANCE_BASE = 50;
const TRADE_CHANCE_STEP = 5;
const TRADE_CHANCE_MIN_REPUTATION = 1;
const ALLY_REPUTATION_THRESHOLD = 5;

export default class AITradeService {

    constructor(reputationService, randomService, tradeService, gameService, diplomacyService) {
        this.reputationService = reputationService;
        this.randomService = randomService;
        this.tradeService = tradeService;
        this.gameService = gameService;
        this.diplomacyService = diplomacyService;

        this.reputationService.on('onReputationIncreased', (args) => this.onReputationIncreased(args.gameId, args.player, args.forPlayer, args.amount));
        this.reputationService.on('onReputationDecreased', (args) => this.onReputationDecreased(args.gameId, args.player, args.forPlayer, args.amount));
    }

    async onReputationIncreased(gameId, player, forPlayer) {
        // Make sure the player is AI.
        if (!player.defeated) {
            return;
        }

        let game = await this.gameService.getById(gameId);

        let reputation = this.reputationService.getReputation(player, forPlayer);

        await this._tryTrade(game, player, forPlayer, reputation);
        await this._tryAlly(game, player, forPlayer, reputation);
    }

    async onReputationDecreased(gameId, player, forPlayer) {
        // Make sure the player is AI.
        if (!player.defeated) {
            return;
        }

        let game = await this.gameService.getById(gameId);

        let reputation = this.reputationService.getReputation(player, forPlayer);

        await this._tryEnemy(game, player, forPlayer, reputation);
    }

    async _tryTrade(game, player, toPlayer, reputation) {
        if (reputation.score < TRADE_CHANCE_MIN_REPUTATION) {
            return;
        }

        let tradeChance = TRADE_CHANCE_BASE + (TRADE_CHANCE_STEP * reputation.score);
        let tradeRoll = this.randomService.getRandomNumber(100);
        let canPerformTrade = tradeRoll <= tradeChance || true;

        if (!canPerformTrade) {
            return;
        }
        
        // TODO: Consider scanning range trade setting.

        // Get the differences in tech levels between the two players that the AI can afford.
        let tradeTechs = await this.tradeService.getTradeableTechnologies(game, player, toPlayer._id);

        tradeTechs = tradeTechs.filter(t => t.cost <= player.credits);

        if (!tradeTechs.length) {
            return;
        }

        // Pick a random tech(?) and send it to the player.
        let tradeTech = tradeTechs[this.randomService.getRandomNumber(tradeTechs.length - 1)];
        
        await this.tradeService.sendTechnology(game, player, toPlayer._id, tradeTech.name, tradeTech.level);
    }

    async _tryAlly(game, player, forPlayer, reputation) {
        // If the game allows alliances and the reputation is greater than a certain threshold
        // then set the diplomatic status to the player to allied.
        if (!this.diplomacyService.isFormalAlliancesEnabled(game)) {
            return;
        }

        if (reputation.score < ALLY_REPUTATION_THRESHOLD) {
            return;
        }

        await this.diplomacyService.declareAlly(game, player._id, forPlayer._id);
    }

    async _tryEnemy(game, player, forPlayer, reputation) {
        // If the game allows alliances and the reputation is less than than a certain threshold
        // then set the diplomatic status to the player to enemy.
        if (!this.diplomacyService.isFormalAlliancesEnabled(game)) {
            return;
        }

        if (reputation.score >= ALLY_REPUTATION_THRESHOLD) {
            return;
        }

        await this.diplomacyService.declareEnemy(game, player._id, forPlayer._id);
    }

};
