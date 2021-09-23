const EventEmitter = require('events');

module.exports = class DiplomacyService extends EventEmitter {

    constructor(gameRepo, playerService) {
        super();

        this.gameRepo = gameRepo;
        this.playerService = playerService;
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
        let playerA = this.playerService.getById(game, playerIdA);
        let playerB = this.playerService.getById(game, playerIdB);

        let statusTo = playerA.diplomacy.allies.find(x => x.equals(playerB._id)) ? 'allies' : 'enemies';
        let statusFrom = playerB.diplomacy.allies.find(x => x.equals(playerA._id)) ? 'allies' : 'enemies';

        let isAllied = statusTo === 'allies' && statusFrom === 'allies';

        let actualStatus = isAllied ? 'allies' : 'enemies';

        return {
            playerId: playerIdB,
            statusTo,
            statusFrom,
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

    isDiplomaticStatusBetweenPlayersAllied(game, playerIds) {
        return this.getDiplomaticStatusBetweenPlayers(game, playerIds) === 'allies';
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
        let player = this.playerService.getById(game, playerId);

        if (player.diplomacy.allies.indexOf(playerIdTarget) === -1) {
            player.diplomacy.allies.push(playerIdTarget);
        }

        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        this.emit('onPlayerDiplomaticStatusChanged', {
            playerId,
            playerIdTarget,
            diplomaticStatus
        });

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
        let player = this.playerService.getById(game, playerId);

        if (player.diplomacy.allies.indexOf(playerIdTarget) >= 0) {
            player.diplomacy.allies.splice(player.diplomacy.allies.indexOf(playerIdTarget), 1);
        }

        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerId, playerIdTarget);

        this.emit('onPlayerDiplomaticStatusChanged', {
            playerId,
            playerIdTarget,
            diplomaticStatus
        });

        return diplomaticStatus;
    }

};
