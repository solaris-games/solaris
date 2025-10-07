import {logger} from "../utils/logging";

import mongoose from 'mongoose';

import { ValidationError } from "solaris-common";
import Repository from './repository';
import StarUpgradeService from './starUpgrade';

import {Game} from "./types/Game";
import {Player, PlayerScheduledActions} from "./types/Player";
import {InfrastructureType} from './types/Star';
import {ObjectId} from "mongoose";
import { DBObjectId } from "./types/DBObjectId";


const buyTypeToPriority = {
    totalCredits: 0,
    belowPrice: 1,
    infrastructureAmount: 2,
    percentageOfCredits: 3
}

const EventEmitter = require('events');

const log = logger("Schedule Buy Service");

export default class ScheduleBuyService extends EventEmitter {
    gameRepo: Repository<Game>;
    starUpgradeService: StarUpgradeService

    constructor(
        gameRepo: Repository<Game>,
        starUpgradeService: StarUpgradeService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.starUpgradeService = starUpgradeService
    }

    async buyScheduledInfrastructure(game: Game) {
        for (let player of game.galaxy.players) {
            if (player.scheduledActions.length == 0) continue;
            const currentActions = player.scheduledActions
                .filter(a => a.tick == game.state.tick) // Tick number that we just finished
                .sort((a, b) => {
                    // Take the defined priorities
                    // We sort in the order totalCredits, belowPrice, infrastructureAmount, percentageOfCredits
                    const valA = buyTypeToPriority[a.buyType];
                    const valB = buyTypeToPriority[b.buyType];
                    return valA - valB // Sort ascending (0 goes first, this is totalCredits)
                });

            // Loop through all actions to execute them.
            for (let action of currentActions) {
                // TODO: Better error handling
                try {
                    if (action.buyType === 'percentageOfCredits') {
                        // As this is sorted, all next ones will also be of this type
                        break;
                    }

                    let amount = action.amount;

                    if (action.buyType === 'totalCredits' && action.amount > player.credits) {
                        // When players schedule actions to spend more credits than they have, we spend all their credits
                        amount = player.credits
                    }

                    const report = await this.starUpgradeService.generateUpgradeBulkReport(game, player, action.buyType, action.infrastructureType, amount);

                    if (report.cost > player.credits) {
                        continue;
                    }

                    await this.starUpgradeService.executeBulkUpgradeReport(game, player, report);
                } catch (e) {
                    log.error(e)
                }
            }

            try {
                // We want to make sure that all percentage actions are dealt with with the same starting value.
                const percentageActions = currentActions.filter(a => a.buyType == 'percentageOfCredits');
                const totalPercentage = percentageActions.reduce((total, cur) => total + cur.amount, 0);
                await this._executePercentageAction(game, player, percentageActions, totalPercentage);
            } catch (e) {
                log.error(e)
            }

            // Only keep actions that are repeated or in the future
            this._repeatOrRemoveAction(game, player.scheduledActions)
        }
    }

    async _executePercentageAction(game: Game, player: Player, percentageActions: PlayerScheduledActions[], totalPercentage: number) {
        for (let action of percentageActions) {
            const percentageToCredits = Math.floor((action.amount / Math.max(totalPercentage, 100)) * player.credits);

            // pass as total credits since percentage was already calculated
            const report = await this.starUpgradeService.generateUpgradeBulkReport(game, player, 'totalCredits', action.infrastructureType, percentageToCredits);

            if (report.cost > player.credits) {
                continue;
            }

            await this.starUpgradeService.executeBulkUpgradeReport(game, player, report);        }
    }

    _repeatOrRemoveAction(game: Game, actions: PlayerScheduledActions[]) {
        const tick = game.state.tick;

        for (let i = 0; i < actions.length; i++) {
            const action = actions[i]
            if (action.repeat) {
                if (action.tick <= tick) {
                    action.tick += game.settings.galaxy.productionTicks;
                }
            } else if (action.tick <= tick) {
                actions.splice(i, 1);
                i--;
            }
        }
    }

    async addScheduledBuy(game: Game, player: Player, buyType: string, infrastructureType: InfrastructureType, amount: number, repeat: boolean, tick: number) {
        const action: PlayerScheduledActions = {
            _id: new mongoose.Types.ObjectId(),
            infrastructureType,
            buyType,
            amount,
            repeat,
            tick
        }

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $push: {
                'galaxy.players.$.scheduledActions': action
            }
        });
        return action;
    }

    async toggleBulkRepeat(game: Game, player: Player, actionId: DBObjectId) {
        const action = player.scheduledActions.find(a => a._id.toString() == actionId.toString());
        if (!action) {
            throw new ValidationError('Action does not exist');
        }
        action.repeat = !action.repeat

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id,
            'galaxy.players.scheduledActions._id': actionId

        }, {
            $set: {
                'galaxy.players.$.scheduledActions.$[].repeat': action.repeat
            }
        });
        return action;
    }

    async trashAction(game: Game, player: Player, actionId: DBObjectId) {
        const action = player.scheduledActions.find(a => a._id.toString() == actionId.toString());
        if (!action) {
            throw new ValidationError('Action does not exist');
        }

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id,
        }, {
            $pull: {
                'galaxy.players.$.scheduledActions': {
                    _id: actionId
                }
            }
        })
        // TODO: Event?
    }
}