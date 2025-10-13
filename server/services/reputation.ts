import Repository from "./repository";
import { Game } from "./types/Game";
import { Player, PlayerReputation } from "./types/Player";
import DiplomacyService from "./diplomacy";
import PlayerStatisticsService from "./playerStatistics";
import PlayerAfkService from "./playerAfk";

import EventEmitter from "events";

const MAX_REPUTATION = 8;
const MIN_REPUTATION = -8;
const REPUTATION_INCREMENT = 1;
const ALLY_REPUTATION_THRESHOLD = 5;
const ENEMY_REPUTATION_THRESHOLD = -1;

export default class ReputationService extends EventEmitter {

    gameRepo: Repository<Game>;
    playerStatisticsService: PlayerStatisticsService;
    diplomacyService: DiplomacyService;
    playerAfkService: PlayerAfkService;

    constructor(
        gameRepo: Repository<Game>,
        playerStatisticsService: PlayerStatisticsService,
        diplomacyService: DiplomacyService,
        playerAfkService: PlayerAfkService
    ) {
        super();
        
        this.gameRepo = gameRepo;
        this.playerStatisticsService = playerStatisticsService;
        this.diplomacyService = diplomacyService;
        this.playerAfkService = playerAfkService;
    }

    getReputation(fromPlayer: Player, toPlayer: Player) {
        let rep: PlayerReputation | null = null;

        if (fromPlayer.reputations) {
            rep = fromPlayer.reputations.find(r => r.playerId.toString() === toPlayer._id.toString())!;
        }

        let isNew: boolean = false;

        if (!rep) {
            rep = {
                playerId: toPlayer._id,
                score: 0
            };

            if (!fromPlayer.reputations) {
                fromPlayer.reputations = [];
            }
            
            fromPlayer.reputations.push(rep);
            isNew = true;
        }

        rep = fromPlayer.reputations.find(r => r.playerId.toString() === toPlayer._id.toString())!;

        return {
            reputation: rep,
            isNew
        };
    }

    async increaseReputation(game: Game, fromPlayer: Player, toPlayer: Player, amount: number = 1, updateDatabase: boolean) {
        let rep = this.getReputation(fromPlayer, toPlayer);

        if (rep.reputation.score < MAX_REPUTATION) {
            rep.reputation.score += amount;
            rep.reputation.score = Math.min(MAX_REPUTATION, rep.reputation.score);
        }

        if (updateDatabase) {
            await this._updateReputation(game, fromPlayer, toPlayer, rep.reputation, rep.isNew);
        }

        if (this.playerAfkService.isAIControlled(game, fromPlayer, true)) {
            await this.recalculateDiplomaticStatus(game, fromPlayer, toPlayer, rep.reputation, updateDatabase);
        }

        return rep;
    }

    async decreaseReputation(game: Game, fromPlayer: Player, toPlayer: Player, updateDatabase: boolean) {
        let rep = this.getReputation(fromPlayer, toPlayer);

        if (rep.reputation.score > MIN_REPUTATION) {
            if (rep.reputation.score > 0) {
                rep.reputation.score = 0;
            } else {
                rep.reputation.score -= REPUTATION_INCREMENT;
                rep.reputation.score = Math.max(MIN_REPUTATION, rep.reputation.score);
            }
        }

        if (updateDatabase) {
            await this._updateReputation(game, fromPlayer, toPlayer, rep.reputation, rep.isNew);
        }

        if (this.playerAfkService.isAIControlled(game, fromPlayer, true)) {
            await this.recalculateDiplomaticStatus(game, fromPlayer, toPlayer, rep.reputation, updateDatabase);
        }

        // For ACTIVE players, any decrease in reputation is considered an act of war.
        // Note: Players who are allied can fight eachother in certain scenarios
        // so it is imperitive that declarations of war do not affect alliances.
        else if (this.diplomacyService.isFormalAlliancesEnabled(game) && 
            this.diplomacyService.getDiplomaticStatusToPlayer(game, fromPlayer._id, toPlayer._id).actualStatus === 'neutral') {
            this.diplomacyService.declareEnemy(game, fromPlayer._id, toPlayer._id, false);
        }

        return rep;
    }

    async _updateReputation(game: Game, fromPlayer: Player, toPlayer: Player, reputation: PlayerReputation, isNew: boolean) {
        if (isNew) {
            return await this.gameRepo.updateOne({
                _id: game._id,
                'galaxy.players._id': fromPlayer._id
            }, {
                $addToSet: {
                    'galaxy.players.$.reputations': reputation
                }
            });
        } else {
            return await this.gameRepo.updateOne({
                _id: game._id,
            }, {
                $set: {
                    'galaxy.players.$[p].reputations.$[r].score': reputation.score
                }
            }, {
                arrayFilters: [
                    {
                        'p._id': fromPlayer._id
                    },
                    {
                        'r.playerId': reputation.playerId
                    }
                ]
            });
        }
    }

    async tryIncreaseReputationCredits(game: Game, fromPlayer: Player, toPlayer: Player, amount: number) {
        let playerStats = this.playerStatisticsService.getStats(game, fromPlayer);
        let creditsRequired = playerStats.totalEconomy * 10 / 2;
        let increased = amount >= creditsRequired;

        if (increased) {
            await this.increaseReputation(game, fromPlayer, toPlayer, REPUTATION_INCREMENT, true);
        }

        return {
            increased,
            rep: this.getReputation(fromPlayer, toPlayer)
        };
    }

    async tryIncreaseReputationCreditsSpecialists(game: Game, fromPlayer: Player, toPlayer: Player, amount: number) {
        let creditsRequired = Math.round(fromPlayer.research.specialists.level / 2);
        let increased = amount >= creditsRequired;

        if (increased) {
            await this.increaseReputation(game, fromPlayer, toPlayer, REPUTATION_INCREMENT, true);
        }

        return {
            increased,
            rep: this.getReputation(fromPlayer, toPlayer)
        };
    }

    async tryIncreaseReputationTechnology(game: Game, fromPlayer: Player, toPlayer: Player, technology) { // TODO: Technology type
        await this.increaseReputation(game, fromPlayer, toPlayer, technology.difference, true);

        return {
            increased: true,
            rep: this.getReputation(fromPlayer, toPlayer)
        };
    }

    async recalculateDiplomaticStatus(game: Game, fromPlayer: Player, toPlayer: Player, reputation: PlayerReputation, updateDatabase: boolean) {
        if (!this.playerAfkService.isAIControlled(game, fromPlayer, true)) {
            throw new Error(`Automatic diplomatic statuses are reserved for AI players only.`);
        }

        const isFormalAlliancesEnabled = this.diplomacyService.isFormalAlliancesEnabled(game);

        if (!isFormalAlliancesEnabled) {
            return;
        }

        const status = this.diplomacyService.getDiplomaticStatusToPlayer(game, fromPlayer._id, toPlayer._id);

        if (reputation.score >= ALLY_REPUTATION_THRESHOLD && status.statusTo !== "allies") {
            await this.diplomacyService.declareAlly(game, fromPlayer._id, toPlayer._id, updateDatabase);
        }
        else if (reputation.score <= ENEMY_REPUTATION_THRESHOLD && status.statusTo !== "enemies") {
            await this.diplomacyService.declareEnemy(game, fromPlayer._id, toPlayer._id, updateDatabase);
        }
        else if (reputation.score > ENEMY_REPUTATION_THRESHOLD && reputation.score < ALLY_REPUTATION_THRESHOLD && status.statusTo !== "neutral") {
            await this.diplomacyService.declareNeutral(game, fromPlayer._id, toPlayer._id, updateDatabase);
        }
    }

    initializeReputationForAlliedPlayers(game: Game, player: Player) {
        const isFormalAlliancesEnabled = this.diplomacyService.isFormalAlliancesEnabled(game);

        if (!isFormalAlliancesEnabled) {
            return;
        }

        const alliedPlayers = this.diplomacyService.getAlliesOfPlayer(game, player);

        for (let alliedPlayer of alliedPlayers) {
            const reputation = this.getReputation(player, alliedPlayer);

            reputation.reputation.score = ALLY_REPUTATION_THRESHOLD;
        }
    }
};
