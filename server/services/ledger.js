const ValidationError = require("../errors/validation");

module.exports = class LedgerService {

    constructor(playerService) {
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

        ledgerB.debt += ledgerA.debt; // Player B no longer has debt to player A
        ledgerA.debt = 0;             // Forgive Player B's debt.

        await game.save();

        return ledgerA;
    }

};
