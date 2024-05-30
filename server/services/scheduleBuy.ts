const mongoose = require('mongoose');

import ValidationError from '../errors/validation';
import Repository from './repository';
import StarUpgradeService from './starUpgrade';

import {Game} from "./types/Game";
import {Player, PlayerScheduledActions} from "./types/Player";
import {InfrastructureType} from './types/Star';
import {ObjectId} from "mongoose";


const buyTypeToPriority = {
    totalCredits: 0,
    belowPrice: 1,
    infrastructureAmount: 2,
    percentageOfCredits: 3
}

const EventEmitter = require('events');

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
            let currentActions = player.scheduledActions
                .filter(a => a.tick == game.state.tick - 1) // Tick number that we just finished
                .sort((a, b) => {
                    // Take the defined priorities
                    // We sort in the order totalCredits, belowPrice, infrastructureAmount, percentageOfCredits
                    const valA = buyTypeToPriority[a.buyType];
                    const valB = buyTypeToPriority[b.buyType];
                    return valA - valB // Sort ascending (0 goes first, this is totalCredits)
                });

            // We do not have to do anything if there is no action to be executed this tick.
            if (currentActions.length === 0) continue;

            // Loop through all actions to execute them.
            for (let action of currentActions) {
                if (action.buyType === 'percentageOfCredits') break; // As this is sorted, all next ones will also be of this type
                if (action.buyType === 'totalCredits' && action.amount > player.credits) {
                    // When players schedule actions to spend more credits than they have, we spend all their credits
                    action.amount = player.credits
                }
                await this.starUpgradeService.upgradeBulk(game, player, action.buyType, action.infrastructureType, action.amount, false)
            }

            // We want to make sure that all percentage actions are dealt with with the same starting value.
            let percentageActions = currentActions.filter(a => a.buyType == 'percentageOfCredits');
            let totalPercentage = percentageActions.reduce((total, cur) => total + cur.amount, 0);
            await this._executePercentageAction(game, player, percentageActions, totalPercentage);

            // Only keep actions that are repeated or in the future
            this._repeatOrRemoveAction(game, player.scheduledActions)
        }
    }

    async _executePercentageAction(game: Game, player: Player, percentageActions: PlayerScheduledActions[], totalPercentage) {
        for (let action of percentageActions) {
            const percentageToCredits = Math.floor((action.amount / Math.max(totalPercentage, 100)) * player.credits)
            await this.starUpgradeService.upgradeBulk(game, player, 'totalCredits', action.infrastructureType, percentageToCredits, false)
        }
    }

    _repeatOrRemoveAction(game: Game, actions: PlayerScheduledActions[]) {
        const tick = game.state.tick - 1;

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
        let action: PlayerScheduledActions = {
            _id: mongoose.Types.ObjectId(),
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

    async toggleBulkRepeat(game: Game, player: Player, actionId: ObjectId) {
        let action = player.scheduledActions.find(a => a._id == actionId);
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

    async trashAction(game: Game, player: Player, actionId: ObjectId) {
        let action = player.scheduledActions.find(a => a._id == actionId);
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