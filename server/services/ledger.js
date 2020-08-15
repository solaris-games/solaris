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

    addDebt(game, playerA, playerB, debt) {
        // Get both of the ledgers between the two players.
        let ledgerA = this.getLedgerForPlayer(game, playerA, playerB._id);
        let ledgerB = this.getLedgerForPlayer(game, playerB, playerA._id);

        ledgerA.debt += debt;   // Player B now has debt to player A
        ledgerB.debt -= debt;   // Player A has paid off some of the debt to player B

        // NOTE: Don't need to add an event because there are already events for
        // when credits are sent and technology is sent so would be useless to add another.
        
        return ledgerA;
    }

    async settleDebt(game, playerA, playerBId) {
        let playerB = this.playerService.getByObjectId(game, playerBId);

        // Get both of the ledgers between the two players.
        let ledgerA = this.getLedgerForPlayer(game, playerA, playerBId);
        let ledgerB = this.getLedgerForPlayer(game, playerB, playerA._id);

        if (ledgerA.debt > 0) {
            throw new ValidationError('You do not owe the player anything.');
        }

        let debtAmount = Math.abs(ledgerA.debt);

        if (playerA.credits < debtAmount) {
            throw new ValidationError('You do not have enough credits to fully settle the debt.')
        }

        ledgerA.debt += debtAmount;
        ledgerB.debt -= debtAmount;

        playerA.credits -= debtAmount;
        playerB.credits += debtAmount;

        await game.save();

        this.emit('onDebtSettled', {
            game,
            debtor: playerA._id,
            creditor: playerB._id,
            amount: debtAmount
        });

        return ledgerA;
    }

    async forgiveDebt(game, playerA, playerBId) {
        let playerB = this.playerService.getByObjectId(game, playerBId);

        // Get both of the ledgers between the two players.
        let ledgerA = this.getLedgerForPlayer(game, playerA, playerBId);
        let ledgerB = this.getLedgerForPlayer(game, playerB, playerA._id);

        if (ledgerA.debt <= 0) {
            throw new ValidationError('The player does not owe you anything.');
        }

        let debtAmount = ledgerA.debt;

        ledgerB.debt += debtAmount; // Player B no longer has debt to player A
        ledgerA.debt = 0;             // Forgive Player B's debt.

        await game.save();

        this.emit('onDebtForgiven', {
            game,
            debtor: playerB._id,
            creditor: playerA._id,
            amount: debtAmount
        });

        return ledgerA;
    }

};
