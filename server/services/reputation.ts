import DatabaseRepository from "../models/DatabaseRepository";
import { Game } from "../types/Game";
import { Player, PlayerReputation } from "../types/Player";
import PlayerService from "./player";

const EventEmitter = require('events');

const MAX_REPUTATION = 8;
const MIN_REPUTATION = -8;
const REPUTATION_INCREMENT = 1;

export default class ReputationService extends EventEmitter {

    constructor(
        gameRepo: DatabaseRepository<Game>,
        playerService: PlayerService
    ) {
        super();
        
        this.gameRepo = gameRepo;
        this.playerService = playerService;
    }

    getReputation(player: Player, forPlayer: Player) {
        let rep: PlayerReputation | null = null;

        if (player.reputations) {
            rep = player.reputations.find(r => r.playerId.toString() === forPlayer._id.toString())!;
        }

        let isNew: boolean = false;

        if (!rep) {
            rep = {
                playerId: forPlayer._id,
                score: 0
            };

            if (!player.reputations) {
                player.reputations = [];
            }
            
            player.reputations.push(rep);
            isNew = true;
        }

        rep = player.reputations.find(r => r.playerId.toString() === forPlayer._id.toString())!;

        return {
            reputation: rep,
            isNew
        };
    }

    async increaseReputation(game: Game, player: Player, forPlayer: Player, amount: number = 1, updateDatabase: boolean = true) {
        let rep = this.getReputation(player, forPlayer);
        let increased = false;

        if (rep.reputation.score < MAX_REPUTATION) {
            rep.reputation.score += amount;
            rep.reputation.score = Math.min(MAX_REPUTATION, rep.reputation.score);
            increased = true;
        }

        if (updateDatabase) {
            await this._updateReputation(game, player, forPlayer, rep.reputation, rep.isNew);
        }

        if (increased) {
            this.emit('onReputationIncreased', {
                gameId: game._id,
                gameTick: game.state.tick,
                player,
                forPlayer,
                score: rep.reputation.score
            });
        }

        return rep;
    }

    async decreaseReputation(game: Game, player: Player, forPlayer: Player, resetReputationAboveZero: boolean = false, updateDatabase: boolean = true) {
        let rep = this.getReputation(player, forPlayer);
        let decreased = false;

        if (rep.reputation.score > MIN_REPUTATION) {
            if (resetReputationAboveZero && rep.reputation.score > 0) {
                rep.reputation.score = 0;
            } else {
                rep.reputation.score -= REPUTATION_INCREMENT;
                rep.reputation.score = Math.max(MIN_REPUTATION, rep.reputation.score);
            }

            decreased = true;
        }

        if (updateDatabase) {
            await this._updateReputation(game, player, forPlayer, rep.reputation, rep.isNew);
        }

        if (decreased) {
            this.emit('onReputationDecreased', {
                gameId: game._id,
                gameTick: game.state.tick,
                player,
                forPlayer,
                score: rep.reputation.score
            });
        }
    }

    async _updateReputation(game: Game, player: Player, forPlayer: Player, reputation: PlayerReputation, isNew: boolean) {
        if (isNew) {
            return await this.gameRepo.updateOne({
                _id: game._id,
                'galaxy.players._id': player._id
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
                        'p._id': player._id
                    },
                    {
                        'r.playerId': reputation.playerId
                    }
                ]
            });
        }
    }

    async tryIncreaseReputationCredits(game: Game, fromPlayer: Player, toPlayer: Player, amount: number) {
        let playerStats = this.playerService.getStats(game, toPlayer);
        let creditsRequired = playerStats.totalEconomy * 10 / 2;

        if (amount >= creditsRequired) {
            return await this.increaseReputation(game, toPlayer, fromPlayer, REPUTATION_INCREMENT);
        }

        return this.getReputation(toPlayer, fromPlayer);
    }

    async tryIncreaseReputationCreditsSpecialists(game: Game, fromPlayer: Player, toPlayer: Player, amount: number) {
        let creditsRequired = Math.round(toPlayer.research.specialists.level / 2);

        if (amount >= creditsRequired) {
            return await this.increaseReputation(game, toPlayer, fromPlayer, REPUTATION_INCREMENT);
        }

        return this.getReputation(toPlayer, fromPlayer);
    }

    async tryIncreaseReputationTechnology(game: Game, fromPlayer: Player, toPlayer: Player, technology: any) { // TODO: Technology type
        return await this.increaseReputation(game, toPlayer, fromPlayer, technology.difference);
    }

};
