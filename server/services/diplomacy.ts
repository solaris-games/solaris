import { ObjectId } from "mongoose";
import DatabaseRepository from "../models/DatabaseRepository";
import { DiplomaticState, DiplomaticStatus } from "../types/Diplomacy";
import { Game } from "../types/Game";
import { Player } from "../types/Player";

export default class DiplomacyService {
    gameRepo: DatabaseRepository<Game>;

    constructor(
        gameRepo: DatabaseRepository<Game>
    ) {
        this.gameRepo = gameRepo;
    }

    isFormalAlliancesEnabled(game: Game) {
        return game.settings.player.alliances === 'enabled';
    }

    getDiplomaticStatusBetweenPlayers(game: Game, playerIds: ObjectId[]) {
        for (let i = 0; i < playerIds.length; i++) {
            for (let ii = 0; ii < playerIds.length; ii++) {
                if (i === ii) {
                    continue;
                }

                let playerIdA = playerIds[i];
                let playerIdB = playerIds[ii];

                let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerIdA, playerIdB);

                if (diplomaticStatus.actualStatus === 'enemies') {
                    return diplomaticStatus.actualStatus;
                }
            }
        }

        return 'allies';
    }

    getDiplomaticStatusToPlayer(game: Game, playerIdA: ObjectId, playerIdB: ObjectId): DiplomaticStatus {
        if (playerIdA.toString() === playerIdB.toString()) return {
            playerIdFrom: playerIdA,
            playerIdTo: playerIdB,
            statusFrom: 'allies',
            statusTo: 'allies',
            actualStatus: 'allies'
        }

        let playerA: Player = game.galaxy.players.find(p => p._id.toString() === playerIdA.toString());
        let playerB: Player = game.galaxy.players.find(p => p._id.toString() === playerIdB.toString());

        let statusTo: DiplomaticState = playerA.diplomacy.allies.find(x => x.equals(playerB._id)) ? 'allies' : 'enemies';
        let statusFrom: DiplomaticState = playerB.diplomacy.allies.find(x => x.equals(playerA._id)) ? 'allies' : 'enemies';

        let isAllied = statusTo === 'allies' && statusFrom === 'allies';

        let actualStatus: DiplomaticState = isAllied ? 'allies' : 'enemies';

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
            if (player._id.equals(otherPlayer._id)) {
                continue;
            }

            diplomaticStatuses.push(this.getDiplomaticStatusToPlayer(game, player._id, otherPlayer._id));
        }

        return diplomaticStatuses;
    }

    getAlliesOfPlayer(game: Game, player: Player): Player[] {
        let allies: Player[] = [];

        for (let otherPlayer of game.galaxy.players) {
            if (otherPlayer._id.equals(player._id)) {
                continue;
            }

            let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, player._id, otherPlayer._id);

            if (diplomaticStatus.actualStatus === 'allies') {
                allies.push(otherPlayer);
            }
        }

        return allies;
    }

    isDiplomaticStatusBetweenPlayersAllied(game: Game, playerIds: ObjectId[]): boolean {
        return this.getDiplomaticStatusBetweenPlayers(game, playerIds) === 'allies';
    }

    isDiplomaticStatusToPlayersAllied(game: Game, playerId: ObjectId, toPlayerIds: ObjectId[]): boolean {
        let playerIdA = playerId;

        for (let i = 0; i < toPlayerIds.length; i++) {
            let playerIdB = toPlayerIds[i];

            let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerIdA, playerIdB);

            if (diplomaticStatus.actualStatus === 'enemies') {
                return false;
            }
        }

        return true;
    }

    getFilteredDiplomacy(player: Player, forPlayer: Player) {
        return {
            allies: player.diplomacy.allies.filter(a => a.equals(forPlayer._id))
        }
    }

    async declareAlly(game: Game, playerId: ObjectId, playerIdTarget: ObjectId) {
        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': playerId
        }, {
            $addToSet: {
                'galaxy.players.$.diplomacy.allies': playerIdTarget
            }
        });

        // Need to do this so we can calculate the new diplomatic status.
        let player: Player = game.galaxy.players.find(p => p._id.equals(playerId));

        if (player.diplomacy.allies.indexOf(playerIdTarget) === -1) {
            player.diplomacy.allies.push(playerIdTarget);
        }

        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        return diplomaticStatus;
    }

    async declareEnemy(game: Game, playerId: ObjectId, playerIdTarget: ObjectId) {
        // When declaring enemies, we need to ensure that both sides are declared
        // otherwise its possible that players can exploit a player who is not online.
        let dbWrites = [
            // Remove alliance for the player to the target.
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': playerId
                    },
                    update: {
                        $pull: {
                            'galaxy.players.$.diplomacy.allies': playerIdTarget
                        }
                    }
                }
            },
            // Remove alliance for the target to the player.
            {
                updateOne: {
                    filter: {
                        _id: game._id,
                        'galaxy.players._id': playerIdTarget
                    },
                    update: {
                        $pull: {
                            'galaxy.players.$.diplomacy.allies': playerId
                        }
                    }
                }
            }
        ];
        
        await this.gameRepo.bulkWrite(dbWrites);

        // Need to do this so we can calculate the new diplomatic status.
        let player: Player = game.galaxy.players.find(p => p._id.equals(playerId));

        if (player.diplomacy.allies.indexOf(playerIdTarget) >= 0) {
            player.diplomacy.allies.splice(player.diplomacy.allies.indexOf(playerIdTarget), 1);
        }

        let targetPlayer: Player = game.galaxy.players.find(p => p._id.equals(playerIdTarget));

        if (targetPlayer.diplomacy.allies.indexOf(playerId) >= 0) {
            targetPlayer.diplomacy.allies.splice(targetPlayer.diplomacy.allies.indexOf(playerId), 1);
        }

        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        return diplomaticStatus;
    }

};
