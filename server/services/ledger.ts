import { DBObjectId } from "../types/DBObjectId";
import DatabaseRepository from "../models/DatabaseRepository";
import { Game } from "../types/Game";
import { Player, PlayerLedger } from "../types/Player";
import PlayerService from "./player";
import PlayerCreditsService from "./playerCredits";

const ValidationError = require("../errors/validation");
const EventEmitter = require('events');

export default class LedgerService extends EventEmitter {
    gameRepo: DatabaseRepository<Game>;
    playerService: PlayerService;
    playerCreditsService: PlayerCreditsService;

    constructor(
        gameRepo: DatabaseRepository<Game>,
        playerService: PlayerService,
        playerCreditsService: PlayerCreditsService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.playerService = playerService;
        this.playerCreditsService = playerCreditsService;
    }

    getLedger(player: Player) {
        return player.ledger;
    }

    getLedgerForPlayer(player: Player, playerId: DBObjectId) {
        let fullLedger = this.getLedger(player);

        // Get the ledger between the two players.
        let playerLedger: PlayerLedger = fullLedger.find(l => l.playerId.toString() === playerId.toString())!;
        let isNew: boolean = false;

        // If no ledger exists, create one.
        if (!playerLedger) {
            playerLedger = {
                playerId,
                debt: 0,
            };

            player.ledger.push(playerLedger);
            isNew = true;
        }

        playerLedger = fullLedger.find(l => l.playerId.toString() === playerId.toString())!;

        return {
            ledger: playerLedger,
            isNew
        };
    }

    async addDebt(game: Game, creditor: Player, debtor: Player, debt: number) {
        // Get both of the ledgers between the two players.
        let ledgerCreditor = this.getLedgerForPlayer(creditor, debtor._id);
        let ledgerDebtor = this.getLedgerForPlayer(debtor, creditor._id);

        ledgerCreditor.ledger.debt += debt;   // Player B now has debt to player A
        ledgerDebtor.ledger.debt -= debt;   // Player A has paid off some of the debt to player B

        await this._updateLedger(game, creditor, ledgerCreditor.ledger, ledgerCreditor.isNew);
        await this._updateLedger(game, debtor, ledgerDebtor.ledger, ledgerDebtor.isNew);
        
        this.emit('onDebtAdded', {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debt
        });

        return ledgerCreditor;
    }

    async settleDebt(game: Game, debtor: Player, playerBId: DBObjectId) {
        let creditor = this.playerService.getById(game, playerBId)!;

        // Get both of the ledgers between the two players.
        let ledgerDebtor = this.getLedgerForPlayer(debtor, playerBId);
        let ledgerCreditor = this.getLedgerForPlayer(creditor, debtor._id);

        if (ledgerDebtor.ledger.debt > 0) {
            throw new ValidationError('You do not owe the player anything.');
        }

        let debtAmount = Math.abs(ledgerDebtor.ledger.debt);

        // If the debtor cannot fully settle the debt then only
        // pay what they can (their total credits)
        if (debtor.credits < debtAmount) {
            debtAmount = debtor.credits;
        }

        ledgerDebtor.ledger.debt += debtAmount;
        ledgerCreditor.ledger.debt -= debtAmount;

        await this.playerCreditsService.addCredits(game, debtor, -debtAmount);
        await this.playerCreditsService.addCredits(game, creditor, debtAmount);

        await this._updateLedger(game, debtor, ledgerDebtor.ledger, ledgerDebtor.isNew);
        await this._updateLedger(game, creditor, ledgerCreditor.ledger, ledgerCreditor.isNew);

        this.emit('onDebtSettled', {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debtAmount
        });

        return ledgerDebtor;
    }

    async forgiveDebt(game: Game, creditor: Player, playerBId: DBObjectId) {
        let debtor = this.playerService.getById(game, playerBId)!;

        // Get both of the ledgers between the two players.
        let ledgerCreditor = this.getLedgerForPlayer(creditor, playerBId);
        let ledgerDebtor = this.getLedgerForPlayer(debtor, creditor._id);

        if (ledgerCreditor.ledger.debt <= 0) {
            throw new ValidationError('The player does not owe you anything.');
        }

        let debtAmount = ledgerCreditor.ledger.debt;

        ledgerDebtor.ledger.debt += debtAmount; // Player B no longer has debt to player A
        ledgerCreditor.ledger.debt = 0;             // Forgive Player B's debt.

        await this._updateLedger(game, creditor, ledgerCreditor.ledger, ledgerCreditor.isNew);
        await this._updateLedger(game, debtor, ledgerDebtor.ledger, ledgerDebtor.isNew);

        this.emit('onDebtForgiven', {
            gameId: game._id,
            gameTick: game.state.tick,
            debtor: debtor._id,
            creditor: creditor._id,
            amount: debtAmount
        });

        return ledgerCreditor;
    }

    async _updateLedger(game: Game, player: Player, ledger: PlayerLedger, isNew: boolean) {
        let dbWrites: any[] = [];

        if (isNew) {
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

        await this.gameRepo.bulkWrite(dbWrites);
    }

};
