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

    getByIdGalaxy(id, userId, callback) {
        return module.exports.getById(id, SELECTS.GALAXY, (err, doc) => {
            if (err) {
                return callback(err);
            }

            doc = doc.toObject();

            // Check if the user is playing in this game.
            let player = doc.galaxy.players.find(x => x.userId === userId);

            // if the user isn't playing this game, then only return
            // basic data about the stars, exclude any important info like garrisons.
            if (!player) {
                doc.galaxy.stars = doc.galaxy.stars
                .map(s => {
                    return {
                        _id: s._id,
                        name: s.name,
                        ownedByPlayerId: s.ownedByPlayerId,
                        location: s.location,
                        homeStar: s.homeStar
                    }
                });

                // Also remove all carriers from players.
                doc.galaxy.players.forEach(p => p.carriers = []);

                return callback(null, doc);
            }

            let scanningRangeDistance = mapHelper.getScanningDistance(player.research.scanning);

            // Get all of the players stars.
            let playerStars = doc.galaxy.stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId.equals(player._id));
            let playerStarLocations = playerStars.map(s => s.location);

            // Work out which ones are not in scanning range and clear their data.
            doc.galaxy.stars = doc.galaxy.stars
                .map(s => {
                    // Ignore stars the player owns, they will always be visible.
                    let isOwnedByPlayer = playerStars.find(y => y._id.equals(s._id));

                    if (isOwnedByPlayer) {
                        return s;
                    }

                    // Get the closest player star to this star.
                    let closest = mapHelper.getClosestStar(s, playerStars);
                    let distance = mapHelper.getDistanceBetweenStars(s, closest);

                    let inRange = distance <= scanningRangeDistance;

                    // If its in range then its all good, send the star back as is.
                    // Otherwise only return a subset of the data.
                    if (inRange) {
                        return s;
                    } else {
                        return {
                            _id: s._id,
                            name: s.name,
                            ownedByPlayerId: s.ownedByPlayerId,
                            location: s.location,
                            homeStar: s.homeStar
                        }
                    }
                });

            // Do the same for carriers.
            doc.galaxy.players.forEach(p => {
                if (p._id.equals(player._id)) return; // Ignore the current player.

                p.carriers = p.carriers.filter(c => {
                    // Get the closest player star to this carrier.
                    let closest = mapHelper.getClosestLocation(c.location, playerStarLocations);
                    let distance = mapHelper.getDistanceBetweenLocations(c.location, closest);

                    let inRange = distance <= scanningRangeDistance;

                    return inRange;
                });
            });

            // TODO: Work out how to do dark galaxy.
            // TODO: Scanning galaxy setting, i.e can't see player so show '???' instead.

            return callback(null, doc);
        });
    },

    create(settings, callback) {
        let game = new Game({
            settings
        });

        // Calculate how many stars we need.
        game._doc.state.stars = game._doc.settings.galaxy.starsPerPlayer * game._doc.settings.general.playerLimit * 2.5;
        game._doc.state.starsForVictory = (game._doc.state.stars / 100) * game._doc.settings.general.starVictoryPercentage;

        // Create all of the stars required.
        game._doc.galaxy.stars = mapHelper.generateStars(game._doc.state.stars, game._doc.settings.general.playerLimit);

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
        module.exports.getById(gameId, {}, (err, game) => {
            if (err) {
                return callback(err);
            }

            // TODO: Disallow if they are already in the game as another player.
            // TODO: Only allow join if the game hasn't started.
            // TODO: Only allow if the player isn't already occupied.
            // TODO: Disallow if they have been defeated and are trying to rejoin.
            // TODO: General checks to ensure that the game hasn't finished
            //       or anything weird like that.

            // Get the player and update it to assign the user to the player.
            let player = game.galaxy.players.find(x => {
                return x._id == playerId;
            });

            if (!player) {
                throw new Error('The player does not exist in this game.');
            }

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
    },

    concedeDefeat(gameId, userId, callback) {
        // Remove the player from the game.
        module.exports.getById(gameId, {}, (err, game) => {
            if (err) {
                return callback(err);
            }

            // TODO: Disallow if they have already been defeated.
            // TODO: General checks to ensure that the game hasn't finished
            //       or anything weird like that.

            // Get the player that is linked to this user.
            let player = game.galaxy.players.find(x => {
                return x.userId == userId;
            });

            if (!player) {
                throw new Error('The user is not participating in this game.');
            }

            player.defeated = true;

            game.save((err, doc) => {
                if (err) {
                    return callback(err);
                }

                return callback(null, doc);
            });
        });
    }
};
