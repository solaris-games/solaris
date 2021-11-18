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

}
