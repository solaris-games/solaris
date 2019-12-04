const gameHelper = require('./game');

module.exports = {

    updateResearchNow(gameId, userId, preference, callback) {
        gameHelper.getByIdAll(gameId, (err, game) => {
            if (err) {
                return callback(err);
            }

            // Get the user's player and update their research preference.
            let userPlayer = game.galaxy.players.find(p => p.userId === userId);

            userPlayer.researchingNow = preference;

            game.save((err, doc) => {
                if (err) {
                    return callback(err);
                }

                return callback(null);
            });
        });
    },

    updateResearchNext(gameId, userId, preference, callback) {
        gameHelper.getByIdAll(gameId, (err, game) => {
            if (err) {
                return callback(err);
            }

            // Get the user's player and update their research preference.
            let userPlayer = game.galaxy.players.find(p => p.userId === userId);

            userPlayer.researchingNext = preference;

            game.save((err, doc) => {
                if (err) {
                    return callback(err);
                }

                return callback(null);
            });
        });
    },

};
