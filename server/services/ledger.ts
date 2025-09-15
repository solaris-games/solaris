import { LedgerType } from "solaris-common";
import { ValidationError } from "solaris-common";
import PlayerService from "./player";
import PlayerCreditsService from "./playerCredits";
import Repository from "./repository";
import { DBObjectId } from "./types/DBObjectId";
import { Game } from "./types/Game";
import { Player, PlayerLedgerDebt } from "./types/Player";

const EventEmitter = require('events');

export const LedgerServiceEvents = {
    onDebtAdded: 'onDebtAdded',
    onDebtSettled: 'onDebtSettled',
    onDebtForgiven: 'onDebtForgiven'
}

export default class LedgerService extends EventEmitter {
    gameRepo: Repository<Game>;
    playerService: PlayerService;
    playerCreditsService: PlayerCreditsService;

    constructor(
        gameRepo: Repository<Game>,
        playerService: PlayerService,
        playerCreditsService: PlayerCreditsService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.playerService = playerService;
        this.playerCreditsService = playerCreditsService;
    }

    getLedger(player: Player, type: LedgerType) {
        return player.ledger[type];
    }

    getLedgerForPlayer(player: Player, playerId: DBObjectId, type: LedgerType) {
        let fullLedger = this.getLedger(player, type);

        // Get the ledger between the two players.
        let playerLedger: PlayerLedgerDebt = fullLedger.find(l => l.playerId.toString() === playerId.toString())!;
        let isNew: boolean = false;

        // If no ledger exists, create one.
        if (!playerLedger) {
            playerLedger = {
                playerId,
                debt: 0,
            };

            player.ledger[type].push(playerLedger);
            isNew = true;
        }

        playerLedger = fullLedger.find(l => l.playerId.toString() === playerId.toString())!;

        return {
            ledger: playerLedger,
            isNew
        };
    }

    async addDebt(game: Game, creditor: Player, debtor: Player, debt: number, type: LedgerType) {
        // Get both of the ledgers between the two players.
        let ledgerCreditor = this.getLedgerForPlayer(creditor, debtor._id, type);
        let ledgerDebtor = this.getLedgerForPlayer(debtor, creditor._id, type);

        ledgerCreditor.ledger.debt += debt;   // Player B now has debt to player A
        ledgerDebtor.ledger.debt -= debt;   // Player A has paid off some of the debt to player B

        await this._updateLedger(game, creditor, ledgerCreditor.ledger, ledgerCreditor.isNew, type);
        await this._updateLedger(game, debtor, ledgerDebtor.ledger, ledgerDebtor.isNew, type);
        
        this.emit(LedgerServiceEvents.onDebtAdded, {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debt,
            ledgerType: type
        });

        return ledgerCreditor;
    }

    async settleDebt(game: Game, debtor: Player, playerBId: DBObjectId, type: LedgerType) {
        let creditor = this.playerService.getById(game, playerBId)!;

        // Get both of the ledgers between the two players.
        let ledgerDebtor = this.getLedgerForPlayer(debtor, playerBId, type);
        let ledgerCreditor = this.getLedgerForPlayer(creditor, debtor._id, type);

        if (ledgerDebtor.ledger.debt > 0) {
            throw new ValidationError('You do not owe the player anything.');
        }

        let debtAmount = Math.abs(ledgerDebtor.ledger.debt);
        let debtorCredits = type === LedgerType.Credits ? debtor.credits : debtor.creditsSpecialists

        // If the debtor cannot fully settle the debt then only
        // pay what they can (their total credits)
        if (debtorCredits < debtAmount) {
            debtAmount = debtorCredits;
        }

        ledgerDebtor.ledger.debt += debtAmount;
        ledgerCreditor.ledger.debt -= debtAmount;

        if (type === LedgerType.Credits) {
            await this.playerCreditsService.addCredits(game, debtor, -debtAmount);
            await this.playerCreditsService.addCredits(game, creditor, debtAmount);
        } else if (type === LedgerType.CreditsSpecialists) {
            await this.playerCreditsService.addCreditsSpecialists(game, debtor, -debtAmount);
            await this.playerCreditsService.addCreditsSpecialists(game, creditor, debtAmount);
        } else {
            throw new Error(`Unsupported ledger type: ${type}`);
        }

        await this._updateLedger(game, debtor, ledgerDebtor.ledger, ledgerDebtor.isNew, type);
        await this._updateLedger(game, creditor, ledgerCreditor.ledger, ledgerCreditor.isNew, type);

        this.emit(LedgerServiceEvents.onDebtSettled, {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debtAmount,
            ledgerType: type
        });

        return ledgerDebtor;
    }

    async forgiveDebt(game: Game, creditor: Player, playerBId: DBObjectId, type: LedgerType) {
        let debtor = this.playerService.getById(game, playerBId)!;

        // Get both of the ledgers between the two players.
        let ledgerCreditor = this.getLedgerForPlayer(creditor, playerBId, type);
        let ledgerDebtor = this.getLedgerForPlayer(debtor, creditor._id, type);

        if (ledgerCreditor.ledger.debt <= 0) {
            throw new ValidationError('The player does not owe you anything.');
        }

        let debtAmount = ledgerCreditor.ledger.debt;

        ledgerDebtor.ledger.debt += debtAmount; // Player B no longer has debt to player A
        ledgerCreditor.ledger.debt = 0;             // Forgive Player B's debt.

        await this._updateLedger(game, creditor, ledgerCreditor.ledger, ledgerCreditor.isNew, type);
        await this._updateLedger(game, debtor, ledgerDebtor.ledger, ledgerDebtor.isNew, type);

        this.emit(LedgerServiceEvents.onDebtForgiven, {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debtAmount,
            ledgerType: type
        });

        return ledgerCreditor;
    }

    async _updateLedger(game: Game, player: Player, ledger: PlayerLedgerDebt, isNew: boolean, type: LedgerType) {
        let dbWrites: any[] = [];

        if (isNew) {
            const updateObject = {
                $push: {}
            };

            // Funky string manipulation
            updateObject.$push[`galaxy.players.$[p].ledger.${type}`] = {
                playerId: ledger.playerId,
                debt: ledger.debt
            };

            dbWrites.push({
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': player._id
                    },
                    update: updateObject,
                    arrayFilters: [
                        { 'p._id': player._id }
                    ]
                }
            });
        } else {
            const updateObject = {};

            // Funky string manipulation
            updateObject[`galaxy.players.$[p].ledger.${type}.$[l].debt`] = ledger.debt;

            dbWrites.push({
                updateOne: {
                    filter: {
                        _id: game._id
                    },
                    update: updateObject,
                    arrayFilters: [
                        { 'p._id': player._id },
                        { 'l.playerId': ledger.playerId }
                    ]
                }
            });
        }

        await this.gameRepo.bulkWrite(dbWrites);
    }

};
