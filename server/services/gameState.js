const moment = require('moment');

module.exports = class GameStateService {

    isInProgress(game) {
        return game.state.startDate && !game.state.endDate;
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
        game.state.players = game.galaxy.players.filter(p => !p.defeated && !p.afk).length;
    }

    finishGame(game, winnerPlayer) {
        game.state.paused = true;
        game.state.endDate = moment().utc();
        game.state.winner = winnerPlayer._id;
    }

}
