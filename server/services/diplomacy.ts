import EventEmitter from "events";
const moment = require('moment')
import { DBObjectId } from "./types/DBObjectId";
import {DiplomacyEvent, DiplomaticState, DiplomaticStatus, ValidationError} from "solaris-common";
import Repository from "./repository";
import { Game } from "./types/Game";
import { Player, PlayerDiplomaticState } from "./types/Player";
import DiplomacyUpkeepService from "./diplomacyUpkeep";
import GameDiplomacyPeaceDeclaredEvent from "./types/events/GameDiplomacyPeaceDeclared";
import GameDiplomacyWarDeclaredEvent from "./types/events/GameDiplomacyWarDeclared";
import { GameEvent } from "./types/GameEvent";

export const DiplomacyServiceEvents = {
    onDiplomacyStatusChanged: 'onDiplomacyStatusChanged',
    onDiplomacyPeaceDeclared: 'onDiplomacyPeaceDeclared',
    onDiplomacyWarDeclared: 'onDiplomacyWarDeclared'
}

export default class DiplomacyService extends EventEmitter {
    gameRepo: Repository<Game>;
    eventRepo: Repository<GameEvent>;
    diplomacyUpkeepService: DiplomacyUpkeepService;

    constructor(
        gameRepo: Repository<Game>,
        eventRepo: Repository<GameEvent>,
        diplomacyUpkeepService: DiplomacyUpkeepService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.eventRepo = eventRepo;
        this.diplomacyUpkeepService = diplomacyUpkeepService;
    }

    isFormalAlliancesEnabled(game: Game): boolean {
        return game.settings.diplomacy.enabled === 'enabled';
    }

    isTradeRestricted(game: Game): boolean {
        return game.settings.diplomacy.tradeRestricted === 'enabled';
    }

    isAllianceLocked(game: Game): boolean {
        return game.settings.diplomacy.lockedAlliances === 'enabled';
    }

    isTeamGame(game: Game): boolean {
        return game.settings.general.mode === 'teamConquest';
    }

    isMaxAlliancesEnabled(game: Game): boolean {
        return game.settings.diplomacy.maxAlliances < game.settings.general.playerLimit - 1
    }

    isGlobalEventsEnabled(game: Game): boolean {
        return game.settings.diplomacy.globalEvents === 'enabled';
    }

    getDiplomaticStatusBetweenPlayers(game: Game, playerIds: DBObjectId[]): DiplomaticState {
        const statuses: DiplomaticState[] = [];

        for (let i = 0; i < playerIds.length; i++) {
            for (let ii = 0; ii < playerIds.length; ii++) {
                if (i === ii) {
                    continue;
                }

                let playerIdA = playerIds[i];
                let playerIdB = playerIds[ii];

                let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerIdA, playerIdB);

                statuses.push(diplomaticStatus.actualStatus);
            }
        }

        if (statuses.indexOf('enemies') > -1) {
            return 'enemies';
        } else if (statuses.indexOf('neutral') > -1) {
            return 'neutral';
        }

        return 'allies';
    }

    getDiplomaticStatusToPlayer(game: Game, playerIdA: DBObjectId, playerIdB: DBObjectId): DiplomaticStatus<DBObjectId> {
        const playerA: Player = game.galaxy.players.find(p => p._id.toString() === playerIdA.toString())!;
        const playerB: Player = game.galaxy.players.find(p => p._id.toString() === playerIdB.toString())!;

        if (playerIdA.toString() === playerIdB.toString()) {
            return {
                playerIdFrom: playerIdA,
                playerIdTo: playerIdB,
                playerFromAlias: playerA.alias,
                playerToAlias: playerB.alias,
                statusFrom: 'allies',
                statusTo: 'allies',
                actualStatus: 'allies'
            };
        }

        const statusTo: DiplomaticState = playerA.diplomacy.find(x => x.playerId.toString() === playerB._id.toString())?.status ?? 'neutral';
        const statusFrom: DiplomaticState = playerB.diplomacy.find(x => x.playerId.toString() === playerA._id.toString())?.status ?? 'neutral';

        let actualStatus: DiplomaticState;

        if (statusTo === 'enemies' || statusFrom === 'enemies') {
            actualStatus = 'enemies';
        } else if (statusTo === 'neutral' || statusFrom === 'neutral') {
            actualStatus = 'neutral';
        } else {
            actualStatus = 'allies';
        }

        return {
            playerIdFrom: playerIdA,
            playerIdTo: playerIdB,
            playerFromAlias: playerA.alias,
            playerToAlias: playerB.alias,
            statusFrom,
            statusTo,
            actualStatus
        };
    }

    getDiplomaticStatusToAllPlayers(game: Game, player: Player): DiplomaticStatus<DBObjectId>[] {
        let diplomaticStatuses: DiplomaticStatus<DBObjectId>[] = [];

        for (let otherPlayer of game.galaxy.players) {
            if (player._id.toString() === otherPlayer._id.toString()) {
                continue;
            }


            //Put alive players on top of defeated ones
            if (!otherPlayer.defeated) {
                diplomaticStatuses.unshift(this.getDiplomaticStatusToPlayer(game, player._id, otherPlayer._id));
            }
            else {
                diplomaticStatuses.push(this.getDiplomaticStatusToPlayer(game, player._id, otherPlayer._id));

            }
        }

        return diplomaticStatuses;
    }

    getAlliesOfPlayer(game: Game, player: Player): Player[] {
        let allies: Player[] = [];

        for (let otherPlayer of game.galaxy.players) {
            if (otherPlayer._id.toString() === player._id.toString()) {
                continue;
            }

            let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, player._id, otherPlayer._id);

            if (diplomaticStatus.actualStatus === 'allies') {
                allies.push(otherPlayer);
            }
        }

        return allies;
    }

    getAlliesOrOffersOfPlayer(game: Game, player: Player): Player[] {
        let allies: Player[] = [];

        for (let otherPlayer of game.galaxy.players) {
            if (otherPlayer._id.toString() === player._id.toString()) {
                continue;
            }

            let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, player._id, otherPlayer._id);

            if (diplomaticStatus.actualStatus === 'allies' || diplomaticStatus.statusTo === 'allies') {
                allies.push(otherPlayer);
            }
        }

        return allies;
    }

    isDiplomaticStatusBetweenPlayersAllied(game: Game, playerIds: DBObjectId[]): boolean {
        return this.getDiplomaticStatusBetweenPlayers(game, playerIds) === 'allies';
    }

    isDiplomaticStatusToPlayersAllied(game: Game, playerId: DBObjectId, toPlayerIds: DBObjectId[]): boolean {
        let playerIdA = playerId;

        for (let i = 0; i < toPlayerIds.length; i++) {
            let playerIdB = toPlayerIds[i];

            let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerIdA, playerIdB);

            if (['enemies', 'neutral'].includes(diplomaticStatus.actualStatus)) {
                return false;
            }
        }

        return true;
    }

    getFilteredDiplomacy(player: Player, forPlayer: Player): PlayerDiplomaticState[] {
        return player.diplomacy.filter(a => a.playerId.toString() === forPlayer._id.toString());
    }

    async _declareStatus(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId, state: DiplomaticState, saveToDB: boolean = true) {
        let player: Player = game.galaxy.players.find(p => p._id.toString() === playerId.toString())!;
        let diplo = player.diplomacy.find(d => d.playerId.toString() === playerIdTarget.toString());

        if (!diplo) {
            diplo = {
                playerId: playerIdTarget,
                status: state
            };

            player.diplomacy.push(diplo);

            if (saveToDB) {
                await this.gameRepo.updateOne({
                    _id: game._id,
                    'galaxy.players._id': playerId
                }, {
                    $addToSet: {
                        'galaxy.players.$.diplomacy': diplo
                    }
                });
            }
        } else {
            diplo.status = state;

            if (saveToDB) {
                await this.gameRepo.updateOne({
                    _id: game._id,
                }, {
                    $set: {
                        'galaxy.players.$[p].diplomacy.$[d].status': diplo.status
                    }
                }, {
                    arrayFilters: [
                        { 'p._id': player._id },
                        { 'd.playerId': diplo.playerId }
                    ]
                });
            }
        }

        // Figure out what the new status is and return.
        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        return diplomaticStatus;
    }

    async declareAlly(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId, saveToDB: boolean = true) {
        let oldStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        if (oldStatus.statusTo === "allies") {
            throw new ValidationError(`The player has already been declared as allies`);
        }

        if (this.isTeamGame(game)) {
            const playerTeam = game.galaxy.teams!.find(t => t.players.map(pid => pid.toString()).includes(playerId.toString()))!;
            const targetPlayerTeam = game.galaxy.teams!.find(t => t.players.map(pid => pid.toString()).includes(playerIdTarget.toString()))!;

            if (playerTeam !== targetPlayerTeam) {
                throw new ValidationError(`You cannot ally a player who is not on your team.`);
            }
        } else if (this.isMaxAlliancesEnabled(game)) {
            let player = game.galaxy.players.find(p => p._id.toString() === playerId.toString())!;
    
            let allianceCount = this.getAlliesOrOffersOfPlayer(game, player).length;

            if (allianceCount >= game.settings.diplomacy.maxAlliances) {
                throw new ValidationError(`You have reached the alliance cap, you cannot declare any more alliances.`);
            }
        }

        // If there is an upkeep cost, deduct 1 cycle's worth of up for 1 alliance upfront.
        if (this.diplomacyUpkeepService.isAllianceUpkeepEnabled(game)) {
            let player = game.galaxy.players.find(p => p._id.toString() === playerId.toString())!;

            await this.diplomacyUpkeepService.deductUpkeep(game, player, 1, saveToDB);
        }
        
        const oldState = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget).actualStatus;

        const newStatus = await this._declareStatus(game, playerId, playerIdTarget, 'allies', saveToDB);

        const isAllied = newStatus.actualStatus === 'allies';
        const isFriendly = isAllied || newStatus.actualStatus === 'neutral';

        this.emit(DiplomacyServiceEvents.onDiplomacyStatusChanged, {
            gameId: game._id,
            gameTick: game.state.tick,
            status: newStatus
        });

        // Create a global event for peace reached
        if (this.isGlobalEventsEnabled(game) && isFriendly && newStatus.actualStatus !== oldState) {
            let e: GameDiplomacyPeaceDeclaredEvent = {
                gameId: game._id,
                gameTick: game.state.tick,
                status: newStatus
            };

            this.emit(DiplomacyServiceEvents.onDiplomacyPeaceDeclared, e);
        }

        return newStatus;
    }

    async declareEnemy(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId, saveToDB: boolean = true) {
        let oldStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        if (this.isAllianceLocked(game) && oldStatus.actualStatus === 'allies') {
            throw new ValidationError(`Alliances cannot be changed in this game.`);
        }

        if (oldStatus.statusTo === "enemies") {
            throw new ValidationError(`The player has already been declared as enemies`);
        }

        let wasAtWar = oldStatus.actualStatus === 'enemies';

        // When declaring enemies, set both to enemies irrespective of which side declared it.
        await this._declareStatus(game, playerId, playerIdTarget, 'enemies', saveToDB);
        await this._declareStatus(game, playerIdTarget, playerId, 'enemies', saveToDB);

        let newStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        this.emit(DiplomacyServiceEvents.onDiplomacyStatusChanged, {
            gameId: game._id,
            gameTick: game.state.tick,
            status: newStatus
        });

        // Create a global event for enemy declaration.
        if (this.isGlobalEventsEnabled(game) && !wasAtWar) {
            let e: GameDiplomacyWarDeclaredEvent = {
                gameId: game._id,
                gameTick: game.state.tick,
                status: newStatus
            };
            
            this.emit(DiplomacyServiceEvents.onDiplomacyWarDeclared, e);
        }

        return newStatus;
    }

    async declareNeutral(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId, saveToDB: boolean = true) {
        let oldStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        if (this.isAllianceLocked(game) && oldStatus.actualStatus === 'allies') {
            throw new ValidationError(`Alliances cannot be changed in this game.`);
        }

        if (oldStatus.statusTo === "neutral") {
            throw new ValidationError(`The player has already been declared as neutral`);
        }

        let wasAtWar = oldStatus.actualStatus === 'enemies';
        let wasAllied = oldStatus.actualStatus === 'allies';
        
        await this._declareStatus(game, playerId, playerIdTarget, 'neutral', saveToDB);

        // When declaring neutral, set both players to neutral if they were allies before.
        if (wasAllied) {
            await this._declareStatus(game, playerIdTarget, playerId, 'neutral', saveToDB);
        }

        let newStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        let isNeutral = newStatus.actualStatus === 'neutral';

        this.emit(DiplomacyServiceEvents.onDiplomacyStatusChanged, {
            gameId: game._id,
            gameTick: game.state.tick,
            status: newStatus
        });

        // Create a global event for peace reached if both players were at war.
        if (this.isGlobalEventsEnabled(game) && wasAtWar && isNeutral) {
            let e: GameDiplomacyPeaceDeclaredEvent = {
                gameId: game._id,
                gameTick: game.state.tick,
                status: newStatus
            };

            this.emit(DiplomacyServiceEvents.onDiplomacyPeaceDeclared, e);
        }

        return newStatus;
    }

    async listDiplomacyEventsBetweenPlayers(game: Game, playerIdA: DBObjectId, playerIdB: DBObjectId): Promise<DiplomacyEvent<DBObjectId>[]> {
        let events = await this.eventRepo.find({
            gameId: game._id,
            playerId: playerIdA,
            type: 'playerDiplomacyStatusChanged',
            $or: [
                { 'data.playerIdFrom': playerIdB },
                { 'data.playerIdTo': playerIdB }
            ]
        });

        return events
        .map(e => {
            return {
                playerId: e.playerId!,
                type: e.type,
                data: e.data,
                sentDate: moment(e._id.getTimestamp()) as Date,
                sentTick: e.tick
            }
        });
    }

};
