module.exports = class GameGalaxyService {

    constructor(mapService, playerService, starService, distanceService, starDistanceService, starUpgradeService, carrierService, waypointService) {
        this.mapService = mapService;
        this.playerService = playerService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.waypointService = waypointService;
    }

    async getGalaxy(game, userId) {
        game = game.toObject();

        // Check if the user is playing in this game.
        let player = this._getUserPlayer(game, userId);
        
        // TODO: If the game has started and the user is not in this game
        // then they cannot view info about this game.

        // TODO: If the game is completed then show everything.

        // Append the player stats to each player.
        this._setPlayerStats(game);

        // if the user isn't playing this game, then only return
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
        const isDarkStart = doc.settings.specialGalaxy.darkGalaxy === 'start'
                                && !((doc.state.startDate || new Date()) < new Date());
    
        return isDarkStart;
    }
    
    _isDarkMode(doc) {
        const isDarkStart = this._isDarkStart(doc);
        
        return doc.settings.specialGalaxy.darkGalaxy === 'enabled' || isDarkStart;
    }

    _getUserPlayer(doc, userId) {
        return doc.galaxy.players.find(x => x.userId === userId);
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
                homeStar: s.homeStar,
                warpGate: s.warpGate,
                stats: s.stats,
                manufacturing: s.manufacturing
            }
        });
    }

    _setStarInfoDetailed(doc, player) { 
        const isDarkMode = this._isDarkMode(doc);

        let scanningRangeDistance = this.distanceService.getScanningDistance(player.research.scanning.level);

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
            let closest = this.starDistanceService.getClosestStar(s, playerStars);
            let distance = this.starDistanceService.getDistanceBetweenStars(s, closest);

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
    }
        
    _setCarrierInfoDetailed(doc, player) {
        let scanningRangeDistance = this.distanceService.getScanningDistance(player.research.scanning.level);

        // Get all of the players stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(doc.galaxy.stars, player._id);
        let playerCarriers = this.carrierService.listCarriersOwnedByPlayer(doc.galaxy.carriers, player._id);
        let playerStarLocations = playerStars.map(s => s.location);

        // TODO: If the current player doesn't own the carrier, then only display a waypoint
        // if the carrier is travelling.

        // Populate the number of ticks it will take for all waypoints.
        playerCarriers.forEach(c => {
            c.waypoints.forEach(w => {
                w.ticks = this.waypointService.calculateWaypointTicks(doc, w);
            });
        });

        // Note that we don't need to consider dark mode
        // because carriers can only be seen if they are in range.

        doc.galaxy.players.forEach(p => {
            // For other players, filter out carriers that the current player cannot see.
            if (!p._id.equals(player._id)) {
                doc.galaxy.carriers = doc.galaxy.carriers.filter(c => {
                    // Get the closest player star to this carrier.
                    let closest = this.distanceService.getClosestLocation(c.location, playerStarLocations);
                    let distance = this.distanceService.getDistanceBetweenLocations(c.location, closest);

                    let inRange = distance <= scanningRangeDistance;

                    return inRange;
                });
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
                    manufacturing: { level: p.research.manufacturing.level },
                },
                isEmptySlot: p.userId == null, // Do not send the user ID back to the client.
                defeated: p.defeated,
                ready: p.ready,
                missedTurns: p.missedTurns,
                _id: p._id,
                alias: p.alias,
                homeStarId: p.homeStarId,
                stats: p.stats
            };
        });
    }

    _clearPlayerCarriers(doc) {
        doc.galaxy.carriers = [];
    }

    _setUpgradeCosts(game, star) {
        const economyExpenseConfig = this.starUpgradeService.EXPENSE_CONFIGS[game.settings.player.developmentCost.economy];
        const industryExpenseConfig = this.starUpgradeService.EXPENSE_CONFIGS[game.settings.player.developmentCost.industry];
        const scienceExpenseConfig = this.starUpgradeService.EXPENSE_CONFIGS[game.settings.player.developmentCost.science];
        const warpGateExpenseConfig = this.starUpgradeService.EXPENSE_CONFIGS[game.settings.specialGalaxy.buildWarpgates];
        const carrierExpenseConfig = this.starUpgradeService.EXPENSE_CONFIGS[game.settings.specialGalaxy.buildCarriers];

        // Calculate upgrade costs for the star.
        star.upgradeCosts = { };

        star.upgradeCosts.economy = this.starUpgradeService.calculateEconomyCost(economyExpenseConfig, star.infrastructure.economy, star.terraformedResources);
        star.upgradeCosts.industry = this.starUpgradeService.calculateIndustryCost(industryExpenseConfig, star.infrastructure.industry, star.terraformedResources);
        star.upgradeCosts.science = this.starUpgradeService.calculateScienceCost(scienceExpenseConfig, star.infrastructure.science, star.terraformedResources);
        star.upgradeCosts.warpGate = this.starUpgradeService.calculateWarpGateCost(warpGateExpenseConfig, star.terraformedResources);
        star.upgradeCosts.carriers = this.starUpgradeService.calculateCarrierCost(carrierExpenseConfig);
    }

};
