const EventEmitter = require('events');

const MAX_REPUTATION = 8;
const MIN_REPUTATION = -8;
const REPUTATION_INCREMENT = 1;

module.exports = class ReputationService extends EventEmitter {

    constructor(gameModel, tradeService, playerService) {
        super();
        
        this.gameModel = gameModel;
        this.tradeService = tradeService;
        this.playerService = playerService;

        this.tradeService.on('onPlayerCreditsReceived', (args) => this.onPlayerCreditsReceived(args.game, args.fromPlayer, args.toPlayer, args.amount));
        this.tradeService.on('onPlayerTechnologyReceived', (args) => this.onPlayerTechnologyReceived(args.game, args.fromPlayer, args.toPlayer, args.technology));
    }

    getReputation(game, player, forPlayer) {
        let reputation = player.reputations.find(r => r.playerId.equals(forPlayer._id));

        if (!reputation) {
            reputation = {
                playerId: forPlayer._id,
                score: 0
            };

            player.reputations.push(reputation);
        }

        return player.reputations.find(r => r.playerId.equals(forPlayer._id));
    }

    async increaseReputation(game, player, forPlayer, amount = 1, updateDatabase = true) {
        let reputation = this.getReputation(game, player, forPlayer);
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
                game,
                player,
                forPlayer,
                score: reputation.score
            });
        }
    }

    async decreaseReputation(game, player, forPlayer, updateDatabase = true) {
        let reputation = this.getReputation(game, player, forPlayer);
        let decreased = false;

        if (reputation.score > MIN_REPUTATION) {
            reputation.score -= REPUTATION_INCREMENT;
            reputation.score = Math.max(MIN_REPUTATION, reputation.score);
            decreased = true;
        }

        if (updateDatabase) {
            await this._updateReputation(game, player, forPlayer, reputation);
        }

        if (decreased) {
            this.emit('onReputationDecreased', {
                game,
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

    async onPlayerCreditsReceived(game, fromPlayer, toPlayer, amount) {
        let playerStats = this.playerService.getStats(game, toPlayer);
        let creditsRequired = playerStats.totalEconomy * 10 / 2;

        if (amount >= creditsRequired) {
            await this.increaseReputation(game, toPlayer, fromPlayer, REPUTATION_INCREMENT);
        }
    }

    async onPlayerTechnologyReceived(game, fromPlayer, toPlayer, technology) {
        await this.increaseReputation(game, toPlayer, fromPlayer, technology.difference);
    }

};
