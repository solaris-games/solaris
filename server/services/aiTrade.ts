import { DBObjectId } from "../types/DBObjectId";
import { Game } from "../types/Game";
import { Player, PlayerReputation } from "../types/Player";
import DiplomacyService from "./diplomacy";
import GameService from "./game";
import RandomService from "./random";
import ReputationService from "./reputation";
import TradeService from "./trade";

const TRADE_CHANCE_BASE = 50;
const TRADE_CHANCE_STEP = 5;
const TRADE_CHANCE_MIN_REPUTATION = 1;
const ALLY_REPUTATION_THRESHOLD = 5;

export default class AITradeService {

    reputationService: ReputationService;
    randomService: RandomService;
    tradeService: TradeService;
    gameService: GameService;
    diplomacyService: DiplomacyService;

    constructor(
        reputationService: ReputationService,
        randomService: RandomService,
        tradeService: TradeService,
        gameService: GameService,
        diplomacyService: DiplomacyService
    ) {
        this.reputationService = reputationService;
        this.randomService = randomService;
        this.tradeService = tradeService;
        this.gameService = gameService;
        this.diplomacyService = diplomacyService;

        this.reputationService.on('onReputationIncreased', (args) => this.onReputationIncreased(args.gameId, args.player, args.forPlayer));
        this.reputationService.on('onReputationDecreased', (args) => this.onReputationDecreased(args.gameId, args.player, args.forPlayer));
    }

    async onReputationIncreased(gameId: DBObjectId, player: any, forPlayer: any) {
        // Make sure the player is AI.
        if (!player.defeated) {
            return;
        }

        let game = await this.gameService.getById(gameId);

        let rep = this.reputationService.getReputation(player, forPlayer);

        await this._tryTrade(game, player, forPlayer, rep.reputation);
        await this._tryAlly(game, player, forPlayer, rep.reputation);
    }

    async onReputationDecreased(gameId: DBObjectId, player: Player, forPlayer: Player) {
        // Make sure the player is AI.
        if (!player.defeated) {
            return;
        }

        let game = await this.gameService.getById(gameId);

        let rep = this.reputationService.getReputation(player, forPlayer);

        await this._tryEnemy(game, player, forPlayer, rep.reputation);
    }

    async _tryTrade(game: Game, player: Player, toPlayer: Player, reputation: PlayerReputation) {
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

    async _tryAlly(game: Game, player: Player, forPlayer: Player, reputation: PlayerReputation) {
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

    async _tryEnemy(game: Game, player: Player, forPlayer: Player, reputation: PlayerReputation) {
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
