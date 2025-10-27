import EventEmitter from "events";
import { ValidationError } from "solaris-common";
import Repository from './repository';
import { Game } from './types/Game';
import { Player } from './types/Player';
import { GameTypeService } from 'solaris-common'

export const PlayerReadyServiceEvents = {
    onGamePlayerReady: 'onGamePlayerReady'
}

export default class PlayerReadyService extends EventEmitter {
    gameRepo: Repository<Game>;
    gameTypeService: GameTypeService;

    constructor(
        gameRepo: Repository<Game>,
        gameTypeService: GameTypeService
    ) {
        super();

        this.gameRepo = gameRepo;
        this.gameTypeService = gameTypeService
    }

    async declareReady(game: Game, player: Player) {
        player.ready = true;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.ready': true
            }
        });

        this.emit(PlayerReadyServiceEvents.onGamePlayerReady, {
            gameId: game._id,
            gameTick: game.state.tick,
        });
    }

    async declareReadyToCycle(game: Game, player: Player) {
        player.ready = true;
        player.readyToCycle = true;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.ready': true,
                'galaxy.players.$.readyToCycle': true
            }
        });

        this.emit(PlayerReadyServiceEvents.onGamePlayerReady, {
            gameId: game._id,
            gameTick: game.state.tick,
        });
    }

    async undeclareReady(game: Game, player: Player) {
        player.ready = false;
        player.readyToCycle = false;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.ready': false,
                'galaxy.players.$.readyToCycle': false
            }
        });
    }

    async declareReadyToQuit(game: Game, player: Player, force: boolean = false) {
        if (!force && game.state.productionTick <= 0) {
            throw new ValidationError('Cannot declare ready to quit until at least 1 production cycle has completed.');
        }

        if (!force && game.settings.general.readyToQuit === 'disabled') {
            throw new ValidationError('Cannot declare ready to quit in this game.');
        }

        player.readyToQuit = true;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.readyToQuit': true
            }
        });
    }

    async undeclareReadyToQuit(game: Game, player: Player) {
        if (game.state.productionTick <= 0) {
            throw new ValidationError('Cannot undeclare ready to quit until at least 1 production cycle has completed.');
        }

        if (this.gameTypeService.isTutorialGame(game)) {
            throw new ValidationError('Cannot undeclare ready to quit in a tutorial.');
        }

        player.readyToQuit = false;

        await this.gameRepo.updateOne({
            _id: game._id,
            'galaxy.players._id': player._id
        }, {
            $set: {
                'galaxy.players.$.readyToQuit': false
            }
        });
    }

    resetReadyStatuses(game: Game, hasProductionTicked: boolean) {
        for (let player of game.galaxy.players) {
            // Reset whether we have sent the player a turn reminder.
            player.hasSentTurnReminder = false;

            // Reset the ready status for players who have a legit user.
            // Accounts could be deleted, could be a tutorial etc.
            if (player.userId == null) {
                player.ready = true;
                player.readyToCycle = true;
            }
            // If the player hasn't ready to cycled then standard procedure applies.
            else if (!player.readyToCycle) {
                player.ready = false;
            }
            // Otherwise if they have ready to cycled then reset only if a production cycle has occurred.
            else if (player.readyToCycle && hasProductionTicked) {
                player.ready = false;
                player.readyToCycle = false;
            }
        }
    }

}
