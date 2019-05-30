const Game = require('./db/models/Game');

module.exports = {

    listOfficialGames(callback) {
        Game.find({
            'settings.general.createdByUserId': { $eq: null }
        }).exec((err, docs) => {
            if (err) {
                return callback(err);
            }

            return callback(null, docs);
        });
    },

    listUserGames(callback) {
        Game.find({
            'settings.general.createdByUserId': { $ne: null }
        }).exec((err, docs) => {
            if (err) {
                return callback(err);
            }

            return callback(null, docs);
        });
    },

    getById(id, callback) {
        Game.findById(id).exec((err, doc) => {
            if (err) {
                return callback(err);
            }

            return callback(null, doc);
        });
    },

    create(settings, callback) {
        let game = new Game({
            settings
        });

        game._doc.galaxy.state.stars = game._doc.settings.galaxy.starsPerPlayer * 10;
        game._doc.galaxy.state.starsForVictory = (game._doc.galaxy.state.stars / 100) * game._doc.settings.general.starVictoryPercentage;

        game.save((err, doc) => {
            if (err) {
                return callback(err);
            }

            callback(null, doc);
        });
    }
};
