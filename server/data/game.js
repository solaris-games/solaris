const Game = require('./db/models/Game');

const mapHelper = require('./map');
const playerHelper = require('./player');

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

        // Calculate how many stars we need.
        game._doc.galaxy.state.stars = game._doc.settings.galaxy.starsPerPlayer * game._doc.settings.general.playerLimit * 2.5;
        game._doc.galaxy.state.starsForVictory = (game._doc.galaxy.state.stars / 100) * game._doc.settings.general.starVictoryPercentage;

        // Create all of the stars required.
        game._doc.galaxy.stars = mapHelper.generateStars(game._doc.galaxy.state.stars);

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
