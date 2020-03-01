const moment = require('moment');
const Game = require('../models/Game');

const MapService = require('./map');
const PlayerService = require('./player');
const StarService = require('./star');

module.exports = class GameService {

    constructor() {
        this.mapService = new MapService();
        this.playerService = new PlayerService();
        this.starService = new StarService();
    }

    async getById(id, select) {
        return await Game.findById(id)
            .select(select)
            .exec();
    }

    async getByIdAll(id) {
        return await this.getById(id, {});
    }

    async getByIdInfo(id) {
        return await this.getById(id, SELECTS.INFO);
    }

    async getByIdGalaxy(id, userId) {
        let doc = await this.getById(id, {});

        doc = doc.toObject();

        // Work out whether we are in dark galaxy mode.
        // This is true if the dark galaxy setting is enabled,
        // OR if its "start only" and the game has not yet started.
        const isDarkStart = doc.settings.specialGalaxy.darkGalaxy === 'start'
                                && !((doc.state.startDate || new Date()) < new Date());

        const isDarkMode = doc.settings.specialGalaxy.darkGalaxy === 'enabled' || isDarkStart;

        // Check if the user is playing in this game.
        let player = doc.galaxy.players.find(x => x.userId === userId);

        // TODO: If the game has started and the user is not in this game
        // then they cannot view info about this game.

        // Append the player stats to each player.
        doc.galaxy.players.forEach(p => {
            // Calculate statistics such as how many carriers they have
            // and what the total number of ships are.
            let playerStars = this.starService.listStarsOwnedByPlayer(doc.galaxy.stars, p._id);
            let totalShips = this.playerService.calculateTotalShipsForPlayer(doc.galaxy.stars, p);

            // Calculate the manufacturing level for all of the stars the player owns.
            playerStars.forEach(s => s.manufacturing = this.starService.calculateStarShipsByTicks(p.research.manufacturing.level, s.industry));

            let totalManufacturing = playerStars.reduce((sum, s) => {
                return sum + s.manufacturing;
            }, 0);

            p.stats = {
                totalStars: playerStars.length,
                totalCarriers: p.carriers.length,
                totalShips,
                newShips: totalManufacturing
            };
        });

        // if the user isn't playing this game, then only return
        // basic data about the stars, exclude any important info like garrisons.
        if (!player) {
            // If its a dark galaxy start then return no stars.
            if (isDarkStart) {
                doc.galaxy.stars = [];
            }

            doc.galaxy.stars = doc.galaxy.stars
            .map(s => {
                return {
                    _id: s._id,
                    name: s.name,
                    ownedByPlayerId: s.ownedByPlayerId,
                    location: s.location,
                    homeStar: s.homeStar,
                    warpGate: s.warpGate,
                    stats: s.stats
                }
            });

            // Also remove all carriers from players.
            doc.galaxy.players.forEach(p => p.carriers = []);

            return doc;
        }

        let scanningRangeDistance = this.mapService.getScanningDistance(player.research.scanning.level);

        // Get all of the players stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(doc.galaxy.stars, player._id);
        let playerStarLocations = playerStars.map(s => s.location);

        // Work out which ones are not in scanning range and clear their data.
        doc.galaxy.stars = doc.galaxy.stars
            .map(s => {
                // Calculate the star's terraformed resources.
                if (s.ownedByPlayerId) {
                    let owningPlayer = doc.galaxy.players.find(x => x._id.equals(s.ownedByPlayerId));

                    s.terraformedResources = this.starService.calculateTerraformedResources(s.naturalResources, owningPlayer.research.terraforming.level);
                }

                // Ignore stars the player owns, they will always be visible.
                let isOwnedByCurrentPlayer = playerStars.find(y => y._id.equals(s._id));

                if (isOwnedByCurrentPlayer) {                        
                    return s;
                }

                // Get the closest player star to this star.
                let closest = this.mapService.getClosestStar(s, playerStars);
                let distance = this.mapService.getDistanceBetweenStars(s, closest);

                let inRange = distance <= scanningRangeDistance;

                // If its in range then its all good, send the star back as is.
                // Otherwise only return a subset of the data.
                if (inRange) {
                    return s;
                } else {
                    // Return null if its dark mode
                    if (isDarkMode) {
                        return null;
                    }

                    return {
                        _id: s._id,
                        name: s.name,
                        ownedByPlayerId: s.ownedByPlayerId,
                        location: s.location,
                        homeStar: s.homeStar,
                        warpGate: s.warpGate
                    }
                }
            })
            // Filter out nulls because those are the ones that have been excluded by dark mode.
            .filter(x => x != null);

        // Do the same for carriers.
        // Note that we don't need to consider dark mode
        // because carriers can only be seen if they are in range.
        doc.galaxy.players.forEach(p => {
            // For other players, filter out carriers that the current player cannot see.
            if (!p._id.equals(player._id)) {
                p.carriers = p.carriers.filter(c => {
                    // Get the closest player star to this carrier.
                    let closest = this.mapService.getClosestLocation(c.location, playerStarLocations);
                    let distance = this.mapService.getDistanceBetweenLocations(c.location, closest);

                    let inRange = distance <= scanningRangeDistance;

                    return inRange;
                });
            }
        });

        // Sanitize other players by only returning basic info about them.
        // We don't want players snooping on others via api responses containing sensitive info.
        doc.galaxy.players = doc.galaxy.players.map(p => {
            // If the user is in the game and it is the current
            // player we are looking at then return everything.
            if (player && p._id == player._id) {
                return p;
            }

            // Return a subset of the user, key info only.
            return {
                colour: p.colour,
                research: {
                    scanning: { level: p.research.scanning.level },
                    hyperspaceRange: { level: p.research.hyperspaceRange.level },
                    terraforming: { level: p.research.terraforming.level },
                    experimentation: { level: p.research.experimentation.level },
                    weapons: { level: p.research.weapons.level },
                    banking: { level: p.research.banking.level },
                    manufacturing: { level: p.research.manufacturing.level },
                },
                userId: p.userId,
                raceId: p.raceId,
                defeated: p.defeated,
                ready: p.ready,
                missedTurns: p.missedTurns,
                carriers: p.carriers,
                _id: p._id,
                alias: p.alias,
                homeStarId: p.homeStarId,
                stats: p.stats
            };
        });

        // TODO: Scanning galaxy setting, i.e can't see player so show '???' instead.
        // TODO: Can we get away with not sending other player's user ids?

        return doc;
    }

    async create(settings) {
        let game = new Game({
            settings
        });

        // Calculate how many stars we need.
        game._doc.state.stars = game._doc.settings.galaxy.starsPerPlayer * game._doc.settings.general.playerLimit * 2.5;
        game._doc.state.starsForVictory = (game._doc.state.stars / 100) * game._doc.settings.general.starVictoryPercentage;

        // Create all of the stars required.
        game._doc.galaxy.stars = this.mapService.generateStars(game._doc.state.stars, game._doc.settings.general.playerLimit);
        
        if (game._doc.settings.specialGalaxy.randomGates !== 'none') {
            this.mapService.generateGates(game._doc.galaxy.stars, game._doc.settings.specialGalaxy.randomGates, game._doc.settings.general.playerLimit);
        }

        // Setup players and assign to their starting positions.
        game._doc.galaxy.players = this.playerService.createEmptyPlayers(game._doc.settings, game._doc.galaxy.stars);

        return await game.save();
    }

    async join(gameId, userId, playerId, raceId, alias) {
        let game = await this.getById(gameId, {});

        // Only allow join if the game hasn't started.
        if (game.state.startDate) {
            throw new Error('The game has already started.');
        }

        // Only allow join if the game hasn't finished.
        if (game.state.endDate) {
            throw new Error('The game has already finished.');
        }

        // Disallow if they are already in the game as another player.
        let existing = game.galaxy.players.find(x => x.userId === userId);

        if (existing) {
            throw new Error('The user is already participating in this game.');
        }

        // Get the player and update it to assign the user to the player.
        let player = game.galaxy.players.find(x => x._id.toString() === playerId);

        if (!player) {
            throw new Error('The player does not exist in this game.');
        }

        // Only allow if the player isn't already occupied.
        if (player && player.userId) {
            throw new Error('This player has already been taken by another user.');
        }

        // TODO: Factor in player type setting. i.e premium players only.

        // Assign the user to the player.
        player.userId = userId;
        player.raceId = raceId;
        player.alias = alias;

        // If the max player count is reached then start the game.
        game.state.playerCount++;

        if (game.state.playerCount === game.settings.general.playerLimit) {
            let start = moment();

            game.state.paused = false;
            game.state.startDate = start.toDate();
            game.state.lastTickDate = start.toDate();
            game.state.nextTickDate = start.add(10, 'm').toDate();
        }

        return await game.save();
    }

    async concedeDefeat(gameId, userId) {
        // Remove the player from the game.
        let game = this.getById(gameId, {});
    
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

        return await game.save();
    }

    async clearData() {
        await Game.deleteMany({});
    }

};
