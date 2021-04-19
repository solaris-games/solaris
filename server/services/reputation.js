const EventEmitter = require('events');

const MAX_REPUTATION = 8;
const MIN_REPUTATION = -8;
const REPUTATION_INCREMENT = 1;

module.exports = class ReputationService extends EventEmitter {

    constructor(gameModel, tradeService, playerService, gameService) {
        super();
        
        this.gameModel = gameModel;
        this.tradeService = tradeService;
        this.playerService = playerService;
        this.gameService = gameService;

        this.tradeService.on('onPlayerCreditsReceived', (args) => this.onPlayerCreditsReceived(args.gameId, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerTechnologyReceived', (args) => this.onPlayerTechnologyReceived(args.gameId, args.fromPlayer, args.toPlayer, args.technology));
    }

    getReputation(player, forPlayer) {
        let reputation = null;

        if (player.reputations) {
            reputation = player.reputations.find(r => r.playerId.equals(forPlayer._id));
        }

        if (!reputation) {
            reputation = {
                playerId: forPlayer._id,
                score: 0
            };

            if (!player.reputations) {
                player.reputations = [];
            }
            
            player.reputations.push(reputation);
        }

        return player.reputations.find(r => r.playerId.equals(forPlayer._id));
    }

    async increaseReputation(game, player, forPlayer, amount = 1, updateDatabase = true) {
        let reputation = this.getReputation(player, forPlayer);
        let increased = false;

        if (reputation.score < MAX_REPUTATION) {
            reputation.score += amount;
            reputation.score = Math.min(MAX_REPUTATION, reputation.score);
            increased = true;
        }

        if (updateDatabase) {
            await this._updateReputation(game, player, forPlayer, reputation);
        }

        if (increased) {
            this.emit('onReputationIncreased', {
                gameId: game._id,
                gameTick: game.state.tick,
                player,
                forPlayer,
                score: reputation.score
            });
        }
    }

    async decreaseReputation(game, player, forPlayer, resetReputationAboveZero = false, updateDatabase = true) {
        let reputation = this.getReputation(player, forPlayer);
        let decreased = false;

        if (reputation.score > MIN_REPUTATION) {
            if (resetReputationAboveZero && reputation.score > 0) {
                reputation.score = 0;
            } else {
                reputation.score -= REPUTATION_INCREMENT;
                reputation.score = Math.max(MIN_REPUTATION, reputation.score);
            }

            decreased = true;
        }

        if (updateDatabase) {
            await this._updateReputation(game, player, forPlayer, reputation);
        }

        if (decreased) {
            this.emit('onReputationDecreased', {
                gameId: game._id,
                gameTick: game.state.tick,
                player,
                forPlayer,
                score: reputation.score
            });
        }
    }

    async _updateReputation(game, player, forPlayer, reputation) {
        if (reputation.isNew) {
            return await this.gameModel.updateOne({
                _id: game._id,
                'galaxy.players._id': player._id
            }, {
                $addToSet: {
                    'galaxy.players.$.reputations': reputation
                }
            });
        } else {
            return await this.gameModel.updateOne({
                _id: game._id,
            }, 
            {
                $set: {
                    'galaxy.players.$[p].reputations.$[r].score': reputation.score
                }
            }, 
            {
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

    async onPlayerCreditsReceived(gameId, fromPlayer, toPlayer, amount) {
        let game = await this.gameService.getById(gameId);
        
        let playerStats = this.playerService.getStats(game, toPlayer);
        let creditsRequired = playerStats.totalEconomy * 10 / 2;

        if (amount >= creditsRequired) {
            await this.increaseReputation(game, toPlayer, fromPlayer, REPUTATION_INCREMENT);
        }
    }

    async onPlayerTechnologyReceived(gameId, fromPlayer, toPlayer, technology) {
        let game = await this.gameService.getById(gameId);

        await this.increaseReputation(game, toPlayer, fromPlayer, technology.difference);
    }

};
