const EventEmitter = require('events');
import { DBObjectId } from "../types/DBObjectId";
import DatabaseRepository from "../models/DatabaseRepository";
import { DiplomaticState, DiplomaticStatus } from "../types/Diplomacy";
import { Game } from "../types/Game";
import { Player, PlayerDiplomacy } from "../types/Player";

export default class DiplomacyService extends EventEmitter {
    gameRepo: DatabaseRepository<Game>;

    constructor(
        gameRepo: DatabaseRepository<Game>
    ) {
        super();

        this.gameRepo = gameRepo;
    }

    isFormalAlliancesEnabled(game: Game): boolean {
        return game.settings.player.alliances === 'enabled';
    }

    getDiplomaticStatusBetweenPlayers(game: Game, playerIds: DBObjectId[]): DiplomaticState {
        let statuses: DiplomaticState[] = [];

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

    getDiplomaticStatusToPlayer(game: Game, playerIdA: DBObjectId, playerIdB: DBObjectId): DiplomaticStatus {
        if (playerIdA.toString() === playerIdB.toString()) {
            return {
                playerIdFrom: playerIdA,
                playerIdTo: playerIdB,
                statusFrom: 'allies',
                statusTo: 'allies',
                actualStatus: 'allies'
            };
        }

        let playerA: Player = game.galaxy.players.find(p => p._id.toString() === playerIdA.toString())!;
        let playerB: Player = game.galaxy.players.find(p => p._id.toString() === playerIdB.toString())!;

        let statusTo: DiplomaticState = playerA.diplomacy.find(x => x.playerId.toString() === playerB._id.toString())?.status ?? 'neutral';
        let statusFrom: DiplomaticState = playerB.diplomacy.find(x => x.playerId.toString() === playerA._id.toString())?.status ?? 'neutral';

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
            statusFrom,
            statusTo,
            actualStatus
        };
    }

    getDiplomaticStatusToAllPlayers(game: Game, player: Player): DiplomaticStatus[] {
        let diplomaticStatuses: DiplomaticStatus[] = [];

        for (let otherPlayer of game.galaxy.players) {
            if (player._id.toString() === otherPlayer._id.toString()) {
                continue;
            }

            diplomaticStatuses.push(this.getDiplomaticStatusToPlayer(game, player._id, otherPlayer._id));
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

    getFilteredDiplomacy(player: Player, forPlayer: Player): PlayerDiplomacy[] {
        return player.diplomacy.filter(d => d.playerId.toString() === forPlayer._id.toString());
    }

    async _declareStatus(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId, state: DiplomaticState, saveToDB: boolean = true) {
        let player: Player = game.galaxy.players.find(p => p._id.toString() === playerId.toString())!;

        // Get the current status between the two players.
        let diplo = player.diplomacy.find(d => d.playerId.toString() === playerIdTarget.toString());

        // If there isn't a status, then its new, insert one.
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
            // Otherwise a diplomatic status exists, update the existing one.
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

    async declareAlly(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId) {
        let wasAtWar = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget).actualStatus === 'enemies';

        let newStatus = await this._declareStatus(game, playerId, playerIdTarget, 'allies');

        let isAllied = newStatus.actualStatus === 'allies';
        let isFriendly = isAllied || newStatus.actualStatus === 'neutral';
        
        // Create a global event for peace reached if both players were at war and are now either neutral or allied.
        if (wasAtWar && isFriendly) {
            this.emit('onDiplomacyPeaceDeclared', {
                gameId: game._id,
                gameTick: game.state.tick,
                status: newStatus
            });
        }

        // Create a private event for alliance established if both players are now allies.
        if (isAllied) {
            this.emit('onDiplomacyAllianceDeclared', {
                gameId: game._id,
                gameTick: game.state.tick,
                status: newStatus
            });
        }

        return newStatus;
    }

    async declareEnemy(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId, saveToDB: boolean = true) {
        let oldStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        let wasAtWar = oldStatus.actualStatus === 'enemies';

        // When declaring enemies, set both to enemies irrespective of which side declared it.
        await this._declareStatus(game, playerId, playerIdTarget, 'enemies', saveToDB);
        await this._declareStatus(game, playerIdTarget, playerId, 'enemies', saveToDB);

        let newStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        // Create a global event for enemy declaration.
        if (!wasAtWar) {
            this.emit('onDiplomacyWarDeclared', {
                gameId: game._id,
                gameTick: game.state.tick,
                status: newStatus
            });
        }

        return newStatus;
    }

    async declareNeutral(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId) {
        let oldStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        let wasAtWar = oldStatus.actualStatus === 'enemies';
        let wasAllied = oldStatus.actualStatus === 'allies';
        
        await this._declareStatus(game, playerId, playerIdTarget, 'neutral');

        // When declaring neutral, set both players to neutral if they were allies before.
        if (wasAllied) {
            await this._declareStatus(game, playerIdTarget, playerId, 'neutral');
        }

        let newStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        let isNeutral = newStatus.actualStatus === 'neutral';

        // Create a global event for peace reached if both players were at war.
        if (wasAtWar && isNeutral) {
            this.emit('onDiplomacyPeaceDeclared', {
                gameId: game._id,
                gameTick: game.state.tick,
                status: newStatus
            });
        }

        return newStatus;
    }

};
