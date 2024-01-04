const mongoose = require('mongoose');

import { DBObjectId } from "./types/DBObjectId";
import { Game } from "./types/Game";
import { Player, PlayerScheduledActions } from "./types/Player";
import { ObjectId } from "mongoose";

const EventEmitter = require('events');

export default class ResearchService extends EventEmitter {
    constructor(
    ) {
        super();
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

    addScheduledBuy(game: Game, player: Player, infrastructureType: string, buyType:string, amount:number, repeat: boolean, tick:number) {
        console.log('addScheduledBuy')
        let action: PlayerScheduledActions = {
            _id: mongoose.Types.ObjectId(),
            infrastructureType,
            buyType,
            amount,
            repeat,
            tick
        }

        // This need some sort of special database write.. However, currently this isnt executed anyway....
        player.scheduledActions.push(action)
        return 'succes'
    }

    toggleBulkRepeat(game: Game, player: Player, actionId: ObjectId) {
        let action = player.scheduledActions.find(a => a._id == actionId);
        if(!action) {
            // TODO: Code error for this, it means that the client has a different set of actionids than the player?!?
            return
        }
        
        action.repeat = !action.repeat
    }
}