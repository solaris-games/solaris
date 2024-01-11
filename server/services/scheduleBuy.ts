const mongoose = require('mongoose');

import ValidationError from '../errors/validation';
import Repository from './repository';
import { Game } from "./types/Game";
import { Player, PlayerScheduledActions } from "./types/Player";
import { ObjectId } from "mongoose";

const EventEmitter = require('events');

export default class ScheduleBuyService extends EventEmitter {
    gameRepo: Repository<Game>;


    constructor(
        gameRepo: Repository<Game>
    ) {
        super();

        this.gameRepo = gameRepo;
    }

    _buyScheduledInfrastructure(game: Game) {
        /*for(let player of game.galaxy.players) {
            let currentActions = player.scheduledActions
                .filter(a => a.tick == game.state.tick - 1)
            let priorityPartition: PlayerScheduledActions[][] = Array(11).map(x => []); // One index for each possible priority
            currentActions.forEach(action => {
                priorityPartition[action.priority].push(action);
            });
            for(let actionList of priorityPartition) {
                this._executePriority(game, player, actionList);
            }
        }*/
    }

    _executePriority(game: Game, player: Player, actionList: PlayerScheduledActions[]) {
        // This function is used to determine the priority between two actions that are done in the same tick.
        /*let percentageList = actionList.filter(action => action.buyType == 'percentage');
        let creditAmountList = actionList.filter(action => action.buyType == 'creditAmount');
        let infrastructureAmountList = actionList.filter(action => action.buyType == 'infrastructureAmount');
        let buyBelowPriceList = actionList.filter(action => action.buyType == 'buyBelowPrice')
        this._executePercentageAction(game, player, percentageList);
        this._executeCreditAction(game, player, creditAmountList);
        this._executeInfrastructureAction(game, player, infrastructureAmountList);
        this._executeBelowPriceAction(game, player, buyBelowPriceList);*/
    }

    _executePercentageAction(game: Game, player: Player, actionList: PlayerScheduledActions[]) {

    }

    _executeCreditAction(game: Game, player: Player, actionList: PlayerScheduledActions[]) {

    }

    _executeInfrastructureAction(game: Game, player: Player, actionList: PlayerScheduledActions[]) {

    }

    _executeBelowPriceAction(game: Game, player: Player, actionList: PlayerScheduledActions[]) {

    }

    async addScheduledBuy(game: Game, player: Player, buyType: string, infrastructureType:string, amount:number, repeat: boolean, tick:number) {
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
        if(!action) {
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
        if(!action) {
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