import { Game } from "./types/Game";
import { Player } from "./types/Player";

const moment = require('moment');

export default class GameStateService {

    isInProgress(game: Game) {
        return game.state.startDate != null && game.state.endDate == null;
    }

    isStarted(game: Game) {
        return game.state.startDate != null;
    }

    isFinished(game: Game) {
        return game.state.endDate != null;
    }

    isLocked(game: Game) {
        return game.state.locked;
    }

    updateStatePlayerCount(game: Game) {
        if (game.settings.general.type === 'tutorial') {
            game.state.players = game.galaxy.players.filter(p => !p.defeated && !p.afk).length;
        } else {
            game.state.players = game.galaxy.players.filter(p => p.userId && !p.defeated && !p.afk).length;
        }
    }

    finishGame(game: Game, winnerPlayer: Player) {
        game.state.paused = true;
        game.state.endDate = moment().utc();
        game.state.winner = winnerPlayer._id;
    }

    isCountingDownToEnd(game: Game) {
        return game.state.ticksToEnd != null;
    }

    isCountingDownToEndInLastCycle(game: Game) {
        return this.isCountingDownToEnd(game) && game.state.ticksToEnd! < game.settings.galaxy.productionTicks;
    }

    countdownToEnd(game: Game) {
        // If we are already in the countdown, decrease the counter.
        // Otherwise, try to start the countdown.
        if (this.isCountingDownToEnd(game)) {
            game.state.ticksToEnd!--;
        } else {
            // Note: This should only occur if in KotH mode.
            game.state.ticksToEnd = game.settings.kingOfTheHill.productionCycles * game.settings.galaxy.productionTicks;
        }
    }

    setCountdownToEndToOneCycle(game: Game) {
        game.state.ticksToEnd = game.settings.galaxy.productionTicks;
    }

    hasReachedCountdownEnd(game: Game) {
        return game.state.ticksToEnd! <= 0;
    }

}
