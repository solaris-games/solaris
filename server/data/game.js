const Game = require('./db/models/Game');

const mapHelper = require('./map');
const playerHelper = require('./player');

const SELECTS = {
    INFO: {
        settings: 1,
        state: 1
    },
    SETTINGS: {
        settings: 1
    },
    GALAXY: {
        galaxy: 1
    }
};

module.exports = {

    listOfficialGames(callback) {
        Game.find({
            'settings.general.createdByUserId': { $eq: null }
        })
            .select(SELECTS.INFO)
            .exec((err, docs) => {
                if (err) {
                    return callback(err);
                }

                return callback(null, docs);
            });
    },

    listUserGames(callback) {
        Game.find({
            'settings.general.createdByUserId': { $ne: null }
        })
            .select(SELECTS.INFO)
            .exec((err, docs) => {
                if (err) {
                    return callback(err);
                }

                return callback(null, docs);
            });
    },

    getById(id, select, callback) {
        Game.findById(id)
            .select(select)
            .exec((err, doc) => {
                if (err) {
                    return callback(err);
                }

                return callback(null, doc);
            });
    },

    getByIdAll(id, callback) {
        return module.exports.getById(id, {}, callback);
    },

    getByIdInfo(id, callback) {
        return module.exports.getById(id, SELECTS.INFO, callback);
    },

    getByIdGalaxy(id, callback) {
        // TODO: Get from the user's perspective. i.e filter out stars that are not in scanning range.
        return module.exports.getById(id, SELECTS.GALAXY, callback);
    },

    create(settings, callback) {
        let game = new Game({
            settings
        });

        // Calculate how many stars we need.
        game._doc.state.stars = game._doc.settings.galaxy.starsPerPlayer * game._doc.settings.general.playerLimit * 2.5;
        game._doc.state.starsForVictory = (game._doc.state.stars / 100) * game._doc.settings.general.starVictoryPercentage;

        // Create all of the stars required.
        game._doc.galaxy.stars = mapHelper.generateStars(game._doc.state.stars);

        // Setup players and assign to their starting positions.
        game._doc.galaxy.players = playerHelper.createEmptyPlayers(game._doc.settings, game._doc.galaxy.stars);

        game.save((err, doc) => {
            if (err) {
                return callback(err);
            }

            callback(null, doc);
        });
    },

    join(gameId, userId, playerId, raceId, alias, callback) {
        module.exports.getById(gameId, (err, game) => {
            if (err) {
                return callback(err);
            }

            // Get the player and update it to assign the user to the player.
            let player = game.galaxy.players.find(x => {
                return x._id == playerId;
            });

            player.userId = userId;
            player.raceId = raceId;
            player.alias = alias;

            game.save((err, doc) => {
                if (err) {
                    return callback(err);
                }

                return callback(null, doc);
            });
        });
    }
};
