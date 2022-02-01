const moment = require('moment');

export default class GameStateService {

    isInProgress(game) {
        return game.state.startDate != null && game.state.endDate == null;
    }

    isStarted(game) {
        return game.state.startDate != null;
    }

    isFinished(game) {
        return game.state.endDate != null;
    }

    isLocked(game) {
        return game.state.locked;
    }

    updateStatePlayerCount(game) {
        if (game.settings.general.type === 'tutorial') {
            game.state.players = game.galaxy.players.filter(p => !p.defeated && !p.afk).length;
        } else {
            game.state.players = game.galaxy.players.filter(p => p.userId && !p.defeated && !p.afk).length;
        }
    }

    finishGame(game, winnerPlayer) {
        game.state.paused = true;
        game.state.endDate = moment().utc();
        game.state.winner = winnerPlayer._id;
    }

    isCountingDownToEnd(game) {
        return game.state.ticksToEnd != null;
    }

    isCountingDownToEndInLastCycle(game) {
        return this.isCountingDownToEnd(game) && game.state.ticksToEnd < game.settings.galaxy.productionTicks;
    }

    countdownToEnd(game) {
        // If we are already in the countdown, decrease the counter.
        // Otherwise, try to start the countdown.
        // Note this only applies to king of the hill.
        if (this.isCountingDownToEnd(game)) {
            game.state.ticksToEnd--;
        } else {
            game.state.ticksToEnd = game.settings.kingOfTheHill.productionCycles * game.settings.galaxy.productionTicks;
        }
    }

    setCountdownToEndToOneCycle(game) {
        game.state.ticksToEnd = game.settings.galaxy.productionTicks;
    }

    hasReachedCountdownEnd(game) {
        return game.state.ticksToEnd <= 0;
    }

}
