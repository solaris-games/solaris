const ValidationError = require("../errors/validation");
const EventEmitter = require('events');

module.exports = class LedgerService extends EventEmitter {

    constructor(gameModel, playerService) {
        super();

        this.gameModel = gameModel;
        this.playerService = playerService;
    }

    getLedger(game, player) {
        return player.ledger;
    }

    getLedgerForPlayer(game, player, playerId) {
        let fullLedger = this.getLedger(game, player);

        // Get the ledger between the two players.
        let playerLedger = fullLedger.find(l => l.playerId.equals(playerId));

        // If no ledger exists, create one.
        if (!playerLedger) {
            playerLedger = {
                playerId,
                debt: 0,
                isNew: true
            };

            player.ledger.push(playerLedger);
        }

        return fullLedger.find(l => l.playerId.equals(playerId));
    }

    async addDebt(game, creditor, debtor, debt) {
        // Get both of the ledgers between the two players.
        let ledgerCreditor = this.getLedgerForPlayer(game, creditor, debtor._id);
        let ledgerDebtor = this.getLedgerForPlayer(game, debtor, creditor._id);

        ledgerCreditor.debt += debt;   // Player B now has debt to player A
        ledgerDebtor.debt -= debt;   // Player A has paid off some of the debt to player B

        await this._updateLedger(game, creditor, ledgerCreditor);
        await this._updateLedger(game, debtor, ledgerDebtor);
        
        this.emit('onDebtAdded', {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debt
        });

        return ledgerCreditor;
    }

    async settleDebt(game, debtor, playerBId) {
        let creditor = this.playerService.getByObjectId(game, playerBId);

        // Get both of the ledgers between the two players.
        let ledgerDebtor = this.getLedgerForPlayer(game, debtor, playerBId);
        let ledgerCreditor = this.getLedgerForPlayer(game, creditor, debtor._id);

        if (ledgerDebtor.debt > 0) {
            throw new ValidationError('You do not owe the player anything.');
        }

        let debtAmount = Math.abs(ledgerDebtor.debt);

        // If the debtor cannot fully settle the debt then only
        // pay what they can (their total credits)
        if (debtor.credits < debtAmount) {
            debtAmount = debtor.credits;
        }

        ledgerDebtor.debt += debtAmount;
        ledgerCreditor.debt -= debtAmount;

        await this.playerService.addCredits(game, debtor, -debtAmount);
        await this.playerService.addCredits(game, creditor, debtAmount);

        await this._updateLedger(game, debtor, ledgerDebtor);
        await this._updateLedger(game, creditor, ledgerCreditor);

        this.emit('onDebtSettled', {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debtAmount
        });

        return ledgerDebtor;
    }

    async forgiveDebt(game, creditor, playerBId) {
        let debtor = this.playerService.getByObjectId(game, playerBId);

        // Get both of the ledgers between the two players.
        let ledgerCreditor = this.getLedgerForPlayer(game, creditor, playerBId);
        let ledgerDebtor = this.getLedgerForPlayer(game, debtor, creditor._id);

        if (ledgerCreditor.debt <= 0) {
            throw new ValidationError('The player does not owe you anything.');
        }

        let debtAmount = ledgerCreditor.debt;

        ledgerDebtor.debt += debtAmount; // Player B no longer has debt to player A
        ledgerCreditor.debt = 0;             // Forgive Player B's debt.

        await this._updateLedger(game, creditor, ledgerCreditor);
        await this._updateLedger(game, debtor, ledgerDebtor);

        this.emit('onDebtForgiven', {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debtAmount
        });

        return ledgerCreditor;
    }

    async _updateLedger(game, player, ledger) {
        let dbWrites = [];

        if (ledger.isNew) {
            dbWrites.push({
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': player._id
                    },
                    update: {
                        $push: { 
                            'galaxy.players.$.ledger': {
                                playerId: ledger.playerId,
                                debt: ledger.debt
                            }
                        }
                    }
                }
            });
        } else {
            dbWrites.push({
                updateOne: {
                    filter: {
                        _id: game._id
                    },
                    update: {
                        'galaxy.players.$[p].ledger.$[l].debt': ledger.debt
                    },
                    arrayFilters: [
                        { 'p._id': player._id },
                        { 'l.playerId': ledger.playerId }
                    ]
                }
            });
        }

        await this.gameModel.bulkWrite(dbWrites);
    }

};
