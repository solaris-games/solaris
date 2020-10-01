const ValidationError = require("../errors/validation");
const EventEmitter = require('events');

module.exports = class LedgerService extends EventEmitter {

    constructor(playerService) {
        super();

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
                debt: 0
            };

            player.ledger.push(playerLedger);
        }

        return fullLedger.find(l => l.playerId.equals(playerId));
    }

    addDebt(game, creditor, debtor, debt) {
        // Get both of the ledgers between the two players.
        let ledgerA = this.getLedgerForPlayer(game, creditor, debtor._id);
        let ledgerB = this.getLedgerForPlayer(game, debtor, creditor._id);

        ledgerA.debt += debt;   // Player B now has debt to player A
        ledgerB.debt -= debt;   // Player A has paid off some of the debt to player B

        this.emit('onDebtAdded', {
            game,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debt
        });

        return ledgerA;
    }

    async settleDebt(game, debtor, playerBId) {
        let creditor = this.playerService.getByObjectId(game, playerBId);

        // Get both of the ledgers between the two players.
        let ledgerA = this.getLedgerForPlayer(game, debtor, playerBId);
        let ledgerB = this.getLedgerForPlayer(game, creditor, debtor._id);

        if (ledgerA.debt > 0) {
            throw new ValidationError('You do not owe the player anything.');
        }

        let debtAmount = Math.abs(ledgerA.debt);

        // If the debtor cannot fully settle the debt then only
        // pay what they can (their total credits)
        if (debtor.credits < debtAmount) {
            debtAmount = debtor.credits;
        }

        ledgerA.debt += debtAmount;
        ledgerB.debt -= debtAmount;

        debtor.credits -= debtAmount;
        creditor.credits += debtAmount;

        await game.save();

        this.emit('onDebtSettled', {
            game,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debtAmount
        });

        return ledgerA;
    }

    async forgiveDebt(game, creditor, playerBId) {
        let debtor = this.playerService.getByObjectId(game, playerBId);

        // Get both of the ledgers between the two players.
        let ledgerA = this.getLedgerForPlayer(game, creditor, playerBId);
        let ledgerB = this.getLedgerForPlayer(game, debtor, creditor._id);

        if (ledgerA.debt <= 0) {
            throw new ValidationError('The player does not owe you anything.');
        }

        let debtAmount = ledgerA.debt;

        ledgerB.debt += debtAmount; // Player B no longer has debt to player A
        ledgerA.debt = 0;             // Forgive Player B's debt.

        await game.save();

        this.emit('onDebtForgiven', {
            game,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debtAmount
        });

        return ledgerA;
    }

};
