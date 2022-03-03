import { DBObjectId } from "../types/DBObjectId";
import DatabaseRepository from "../models/DatabaseRepository";
import { DiplomaticState, DiplomaticStatus } from "../types/Diplomacy";
import { Game } from "../types/Game";
import { Player, PlayerDiplomacy } from "../types/Player";

export default class DiplomacyService {
    gameRepo: DatabaseRepository<Game>;

    constructor(
        gameRepo: DatabaseRepository<Game>
    ) {
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

    async _declareStatus(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId, state: DiplomaticState) {
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

            await this.gameRepo.updateOne({
                _id: game._id,
                'galaxy.players._id': playerId
            }, {
                $addToSet: {
                    'galaxy.players.$.diplomacy': diplo
                }
            });
        } else {
            // Otherwise a diplomatic status exists, update the existing one.
            diplo.status = state;

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

        // Figure out what the new status is and return.
        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        return diplomaticStatus;
    }

    async declareAlly(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId) {
        return await this._declareStatus(game, playerId, playerIdTarget, 'allies');
    }

    async declareEnemy(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId) {
        // When declaring enemies, set both to enemies irrespective of which side declared it.
        await this._declareStatus(game, playerId, playerIdTarget, 'enemies');
        await this._declareStatus(game, playerIdTarget, playerId, 'enemies');

        return this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);
    }

    async declareNeutral(game: Game, playerId: DBObjectId, playerIdTarget: DBObjectId) {
        return await this._declareStatus(game, playerId, playerIdTarget, 'neutral');
    }

};
