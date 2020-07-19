const ValidationError = require('../errors/validation');

module.exports = class GameGalaxyService {

    constructor(mapService, playerService, starService, distanceService, 
        starDistanceService, starUpgradeService, carrierService, 
        waypointService, researchService) {
        this.mapService = mapService;
        this.playerService = playerService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.waypointService = waypointService;
        this.researchService = researchService;
    }

    async getGalaxy(game, userId) {
        game = game.toObject();

        // Check if the user is playing in this game.
        let player = this._getUserPlayer(game, userId);
        
        // If the game has started and the user is not in this game
        // then they cannot view info about this game.
        if (game.state.startDate && !player) {
            throw new ValidationError('Cannot view information about this game, you are not playing.');
        }

        // TODO: If the game is completed then show everything.

        // Append the player stats to each player.
        this._setPlayerStats(game);

        // if the user isn't playing this game yet, then only return
        // basic data about the stars, exclude any important info like garrisons.
        if (!player) {
            this._setStarInfoBasic(game);

            // Also remove all carriers from players.
            this._clearPlayerCarriers(game);

            // We still need to filter the player data so that it's basic info.
            this._setPlayerInfoBasic(game, null);
        } else {
            // Populate the rest of the details about stars,
            // carriers and players providing that they are in scanning range.
            this._setStarInfoDetailed(game, player);
            this._setCarrierInfoDetailed(game, player);
            this._setPlayerInfoBasic(game, player);
    
            // TODO: Scanning galaxy setting, i.e can't see player so show '???' instead.
        }
        
        return game;
    }
    
    _isDarkStart(doc) {
        // Work out whether we are in dark galaxy mode.
        // This is true if the dark galaxy setting is enabled,
        // OR if its "start only" and the game has not yet started.
        return doc.settings.specialGalaxy.darkGalaxy === 'start'
    }
    
    _isDarkMode(doc) {
        return doc.settings.specialGalaxy.darkGalaxy === 'enabled';
    }

    _getUserPlayer(doc, userId) {
        return doc.galaxy.players.find(x => x.userId === userId.toString());
    }

    _setPlayerStats(doc) {
        // Get all of the player's statistics.
        doc.galaxy.players.forEach(p => {
            p.stats = this.playerService.getStats(doc, p);
        });
    }

    _setStarInfoBasic(doc) {
        // Work out whether we are in dark galaxy mode.
        // This is true if the dark galaxy setting is enabled,
        // OR if its "start only" and the game has not yet started.
        const isDarkStart = this._isDarkStart(doc);
        const isDarkMode = this._isDarkMode(doc);

        // If its a dark galaxy start then return no stars.
        if (isDarkStart || isDarkMode) {
            doc.galaxy.stars = [];
        }

        doc.galaxy.stars = doc.galaxy.stars
        .map(s => {
            return {
                _id: s._id,
                name: s.name,
                ownedByPlayerId: s.ownedByPlayerId,
                location: s.location,
                warpGate: s.warpGate,
                stats: s.stats,
                manufacturing: s.manufacturing
            }
        });
    }

    _setStarInfoDetailed(doc, player) { 
        const isDarkStart = this._isDarkStart(doc);
        const isDarkMode = this._isDarkMode(doc);

        // If dark start and game hasn't started yet OR is dark mode, then filter out
        // any stars the player cannot see in scanning range.
        if (isDarkMode || (isDarkStart && !doc.state.startDate)) {
            doc.galaxy.stars = this.starService.getStarsWithinScanningRangeOfPlayer(doc, player._id);
        }

        let scanningRangeDistance = this.distanceService.getScanningDistance(doc, player.research.scanning.level);

        // Get all of the player's stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(doc.galaxy.stars, player._id);

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
                // Calculate infrastructure upgrades for the star.
                this._setUpgradeCosts(doc, s);
                
                return s;
            }

            // Get the closest player star to this star.
            let inRange = false;

            if (playerStars.length) {
                let closest = this.starDistanceService.getClosestStar(s, playerStars);
                let distance = this.starDistanceService.getDistanceBetweenStars(s, closest);
    
                inRange = distance <= scanningRangeDistance;
            }

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
                    warpGate: s.warpGate
                }
            }
        })
        // Filter out nulls because those are the ones that have been excluded by dark mode.
        .filter(x => x != null);
    }
        
    _setCarrierInfoDetailed(doc, player) {
        let scanningRangeDistance = this.distanceService.getScanningDistance(doc, player.research.scanning.level);

        // Get all of the players stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(doc.galaxy.stars, player._id);
        let playerStarLocations = playerStars.map(s => s.location);

        // Filter out any carriers that are outside of scanning range.
        // NOTE: We don't need to consider dark mode
        // because carriers can only be seen if they are in range.
        doc.galaxy.carriers = doc.galaxy.carriers
            .filter(c => {
                // If the player owns the carrier then it will always be visible.
                if (c.ownedByPlayerId.equals(player._id)) {
                    return true;
                }

                // Get the closest player star to this carrier.
                let closest = this.distanceService.getClosestLocation(c.location, playerStarLocations);
                let distance = this.distanceService.getDistanceBetweenLocations(c.location, closest);

                let inRange = distance <= scanningRangeDistance;

                return inRange;
            });

        // Remove all waypoints (except those in transit) for all carriers that do not belong
        // to the player.
        doc.galaxy.carriers
            .filter(c => !c.ownedByPlayerId.equals(player._id))
            .forEach(c => {
                if (!c.orbiting) {
                    c.waypoints = c.waypoints.slice(0, 1);
                } else {
                    c.waypoints = [];
                }

                // Return only key data about the waypoints.
                c.waypoints = c.waypoints.map(w => {
                    return {
                        _id: w._id,
                        source: w.source,
                        destination: w.destination
                    };
                });
            });

        // Populate the number of ticks it will take for all waypoints.
        doc.galaxy.carriers
            .forEach(c => {
                c.waypoints.forEach(w => {
                    w.ticks = this.waypointService.calculateWaypointTicks(doc, c, w);
                    w.ticksEta = this.waypointService.calculateWaypointTicksEta(doc, c, w);
                });

                if (c.waypoints.length) {
                    c.ticksEta = c.waypoints[0].ticksEta;
                    c.ticksEtaTotal = c.waypoints[c.waypoints.length - 1].ticksEta;
                } else {
                    c.ticksEta = null;
                    c.ticksEtaTotal = null;
                }
            });
    }

    _setPlayerInfoBasic(doc, player) {
        // Sanitize other players by only returning basic info about them.
        // We don't want players snooping on others via api responses containing sensitive info.
        doc.galaxy.players = doc.galaxy.players.map(p => {
            // If the user is in the game and it is the current
            // player we are looking at then return everything.
            if (player && p._id == player._id) {
                player.currentResearchTicksEta = this.researchService.calculateCurrentResearchETAInTicks(doc, player);

                return p;
            }

            // Return a subset of the user, key info only.
            return {
                colour: p.colour,
                research: {
                    scanning: { level: p.research.scanning.level },
                    hyperspace: { level: p.research.hyperspace.level },
                    terraforming: { level: p.research.terraforming.level },
                    experimentation: { level: p.research.experimentation.level },
                    weapons: { level: p.research.weapons.level },
                    banking: { level: p.research.banking.level },
                    manufacturing: { level: p.research.manufacturing.level }
                },
                isEmptySlot: p.userId == null, // Do not send the user ID back to the client.
                defeated: p.defeated,
                afk: p.afk,
                _id: p._id,
                alias: p.alias,
                homeStarId: p.homeStarId,
                stats: p.stats
            };
        });
    }

    _hasGameStarted(doc) {
        return doc.state.startDate != null;
    }

    _clearPlayerCarriers(doc) {
        doc.galaxy.carriers = [];
    }

    _setUpgradeCosts(game, star) {
        const economyExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.economy];
        const industryExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.industry];
        const scienceExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.player.developmentCost.science];
        const warpGateExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.warpgateCost];
        const carrierExpenseConfig = game.constants.star.infrastructureExpenseMultipliers[game.settings.specialGalaxy.carrierCost];

        // Calculate upgrade costs for the star.
        star.upgradeCosts = { };

        star.upgradeCosts.economy = this.starUpgradeService.calculateEconomyCost(game, economyExpenseConfig, star.infrastructure.economy, star.terraformedResources);
        star.upgradeCosts.industry = this.starUpgradeService.calculateIndustryCost(game, industryExpenseConfig, star.infrastructure.industry, star.terraformedResources);
        star.upgradeCosts.science = this.starUpgradeService.calculateScienceCost(game, scienceExpenseConfig, star.infrastructure.science, star.terraformedResources);
        star.upgradeCosts.warpGate = this.starUpgradeService.calculateWarpGateCost(game, warpGateExpenseConfig, star.terraformedResources);
        star.upgradeCosts.carriers = this.starUpgradeService.calculateCarrierCost(game, carrierExpenseConfig);
    }

};
