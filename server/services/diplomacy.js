module.exports = class DiplomacyService {

    constructor(gameRepo) {
        this.gameRepo = gameRepo;
    }

    isFormalAlliancesEnabled(game) {
        return game.settings.player.alliances === 'enabled';
    }

    getDiplomaticStatusBetweenPlayers(game, playerIds) {
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

    getDiplomaticStatusToPlayer(game, playerIdA, playerIdB) {
        if (playerIdA.equals(playerIdB)) return {
            playerIdFrom: playerIdA,
            playerIdTo: playerIdB,
            statusFrom: 'allies',
            statusTo: 'allies',
            actualStatus: 'allies'
        }

        let playerA = game.galaxy.players.find(p => p._id.toString() === playerIdA.toString());
        let playerB = game.galaxy.players.find(p => p._id.toString() === playerIdB.toString());

        let statusTo = playerA.diplomacy.allies.find(x => x.equals(playerB._id)) ? 'allies' : 'enemies';
        let statusFrom = playerB.diplomacy.allies.find(x => x.equals(playerA._id)) ? 'allies' : 'enemies';

        let isAllied = statusTo === 'allies' && statusFrom === 'allies';

        let actualStatus = isAllied ? 'allies' : 'enemies';

        return {
            playerIdFrom: playerIdA,
            playerIdTo: playerIdB,
            statusFrom,
            statusTo,
            actualStatus
        };
    }

    getDiplomaticStatusToAllPlayers(game, player) {
        let diplomaticStatuses = [];

        for (let otherPlayer of game.galaxy.players) {
            if (player._id.equals(otherPlayer._id)) {
                continue;
            }

            diplomaticStatuses.push(this.getDiplomaticStatusToPlayer(game, player._id, otherPlayer._id));
        }

        return diplomaticStatuses;
    }

    getAlliesOfPlayer(game, player) {
        let allies = [];

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

    isDiplomaticStatusBetweenPlayersAllied(game, playerIds) {
        return this.getDiplomaticStatusBetweenPlayers(game, playerIds) === 'allies';
    }

    isDiplomaticStatusToPlayersAllied(game, playerId, toPlayerIds) {
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

    async declareAlly(game, playerId, playerIdTarget) {
        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': playerId
        }, {
            $addToSet: {
                'galaxy.players.$.diplomacy.allies': playerIdTarget
            }
        });

        // Need to do this so we can calculate the new diplomatic status.
        let player = game.galaxy.players.find(p => p._id.equals(playerId));

        if (player.diplomacy.allies.indexOf(playerIdTarget) === -1) {
            player.diplomacy.allies.push(playerIdTarget);
        }

        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        return diplomaticStatus;
    }

    async declareEnemy(game, playerId, playerIdTarget) {
        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': playerId
        }, {
            $pull: {
                'galaxy.players.$.diplomacy.allies': playerIdTarget
            }
        });

        // Need to do this so we can calculate the new diplomatic status.
        let player = game.galaxy.players.find(p => p._id.equals(playerId));

        if (player.diplomacy.allies.indexOf(playerIdTarget) >= 0) {
            player.diplomacy.allies.splice(player.diplomacy.allies.indexOf(playerIdTarget), 1);
        }

        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        return diplomaticStatus;
    }

};
