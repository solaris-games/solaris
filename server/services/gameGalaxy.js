module.exports = class GameGalaxyService {

    constructor(broadcastService, gameService, mapService, playerService, starService, distanceService, 
        starDistanceService, starUpgradeService, carrierService, 
        waypointService, researchService, specialistService, technologyService, reputationService,
        guildUserService, historyService) {
        this.broadcastService = broadcastService;
        this.gameService = gameService;
        this.mapService = mapService;
        this.playerService = playerService;
        this.starService = starService;
        this.distanceService = distanceService;
        this.starDistanceService = starDistanceService;
        this.starUpgradeService = starUpgradeService;
        this.carrierService = carrierService;
        this.waypointService = waypointService;
        this.researchService = researchService;
        this.specialistService = specialistService;
        this.technologyService = technologyService;
        this.reputationService = reputationService;
        this.guildUserService = guildUserService;
        this.historyService = historyService;
    }

    async getGalaxy(game, userId) {
        // Check if the user is playing in this game.
        let player = this._getUserPlayer(game, userId);
        
        // Remove who created the game.
        delete game.settings.general.createdByUserId;
        delete game.settings.general.password; // Don't really need to explain why this is removed.

        await this._maskGalaxy(game, player);

        // Append the player stats to each player.
        this._setPlayerStats(game);

        // if the user isn't playing this game, then only return
        // basic data about the stars, exclude any important info like garrisons.
        if (!player) {
            this._setStarInfoBasic(game);

            // Also remove all carriers from players.
            this._clearPlayerCarriers(game);

            // We still need to filter the player data so that it's basic info.
            await this._setPlayerInfoBasic(game, null);
        } else {
            // Populate the rest of the details about stars,
            // carriers and players providing that they are in scanning range.
            this._setCarrierInfoDetailed(game, player);
            this._setStarInfoDetailed(game, player);
            await this._setPlayerInfoBasic(game, player);
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
        if (isDarkMode || (isDarkStart && !doc.state.startDate)) {
            doc.galaxy.stars = [];
        }

        doc.galaxy.stars = doc.galaxy.stars
        .map(s => {
            return {
                _id: s._id,
                name: s.name,
                ownedByPlayerId: s.ownedByPlayerId,
                location: s.location,
                warpGate: false
            }
        });
    }

    _setStarInfoDetailed(doc, player) { 
        const isFinished = this.gameService.isFinished(doc);
        const isDarkStart = this._isDarkStart(doc);
        const isDarkMode = this._isDarkMode(doc);

        // If dark start and game hasn't started yet OR is dark mode, then filter out
        // any stars the player cannot see in scanning range.
        if (!isFinished && (isDarkMode || (isDarkStart && !doc.state.startDate))) {
            if (isDarkMode) {
                doc.galaxy.stars = this.starService.filterStarsByScanningRangeAndWaypointDestinations(doc, player);
            } else {
                doc.galaxy.stars = this.starService.filterStarsByScanningRange(doc, player);
            }
        }

        // Get all of the player's stars.
        let playerStars = this.starService.listStarsOwnedByPlayer(doc.galaxy.stars, player._id);

        // Work out which ones are not in scanning range and clear their data.
        doc.galaxy.stars = doc.galaxy.stars
        .map(s => {
            delete s.garrisonActual; // Don't need to send this back.

            // Calculate the star's terraformed resources.
            if (s.ownedByPlayerId) {
                let owningPlayerEffectiveTechs = this.technologyService.getStarEffectiveTechnologyLevels(doc, s);

                s.terraformedResources = this.starService.calculateTerraformedResources(s.naturalResources, owningPlayerEffectiveTechs.terraforming);
            }

            // Ignore stars the player owns, they will always be visible.
            let isOwnedByCurrentPlayer = playerStars.find(y => y._id.equals(s._id));

            if (isOwnedByCurrentPlayer) {
                // Calculate infrastructure upgrades for the star.
                this.starUpgradeService.setUpgradeCosts(doc, s);
                
                if (s.specialistId) {
                    s.specialist = this.specialistService.getByIdStar(s.specialistId);
                }

                s.ignoreBulkUpgrade = s.ignoreBulkUpgrade || false; // TODO: For some reason this isn't being set in the mongoose defaults?

                return s;
            } else {
                // Remove fields that the user player shouldn't see.
                delete s.ignoreBulkUpgrade;
            }

            // Get the closest player star to this star.
            let inRange = isFinished || this.starService.isStarInScanningRangeOfPlayer(doc, s, player);

            // If its in range then its all good, send the star back as is.
            // Otherwise only return a subset of the data.
            if (inRange) {
                if (s.specialistId) {
                    s.specialist = this.specialistService.getByIdStar(s.specialistId);
                }
                
                let canSeeStarGarrison = this.starService.canPlayerSeeStarGarrison(player, s);

                if (!canSeeStarGarrison) {
                    s.garrison = null;
                }

                return s;
            } else {
                return {
                    _id: s._id,
                    name: s.name,
                    ownedByPlayerId: s.ownedByPlayerId,
                    location: s.location,
                    warpGate: false // Hide warp gates outside of scanning range.
                }
            }
        });
    }
        
    _setCarrierInfoDetailed(doc, player) {
        // If the game hasn't finished we need to filter and sanitize carriers.
        if (!this.gameService.isFinished(doc)) {
            doc.galaxy.carriers = this.carrierService.filterCarriersByScanningRange(doc, player);
        
            // Remove all waypoints (except those in transit) for all carriers that do not belong
            // to the player.
            doc.galaxy.carriers = this.carrierService.sanitizeCarriersByPlayer(doc, player);
        }

        // Populate the number of ticks it will take for all waypoints.
        doc.galaxy.carriers
            .forEach(c => {
                this.waypointService.populateCarrierWaypointEta(doc, c);
                
                if (c.specialistId) {
                    c.specialist = this.specialistService.getByIdCarrier(c.specialistId)
                }

                if (!this.carrierService.canPlayerSeeCarrierShips(player, c)) {
                    c.ships = null;
                }
            });
    }

    async _setPlayerInfoBasic(doc, player) {
        // Get the list of all guilds associated to players, we'll need this later.
        let guildUsers = [];

        if (doc.settings.general.anonymity === 'normal') {
            let userIds = doc.galaxy.players.filter(x => x.userId).map(x => x.userId);
            guildUsers = await this.guildUserService.listUsersWithGuildTags(userIds)
        }

        // Calculate which players are in scanning range.
        let playersInRange = [];
        
        if (player) {
            playersInRange = this.playerService.getPlayersWithinScanningRangeOfPlayer(doc, player);
        }

        let displayOnlineStatus = doc.settings.general.playerOnlineStatus === 'visible';

        this._populatePlayerHasDuplicateIPs(doc);
        
        // Sanitize other players by only returning basic info about them.
        // We don't want players snooping on others via api responses containing sensitive info.
        doc.galaxy.players = doc.galaxy.players.map(p => {
            // Append the guild tag to the player alias.
            let playerGuild = null;

            if (p.userId) {
                let guildUser = guildUsers.find(u => u._id.toString() === p.userId.toString());

                if (guildUser) {
                    playerGuild = guildUser.guild;
    
                    if (playerGuild) {
                        p.alias += `[${playerGuild.tag}]`;
                    }
                }
            }

            let effectiveTechs = this.technologyService.getPlayerEffectiveTechnologyLevels(doc, p);

            p.isInScanningRange = playersInRange.find(x => x._id.equals(p._id)) != null;
            p.shape = p.shape || 'circle'; // TODO: I don't know why the shape isn't being returned by mongoose defaults.

            // If the user is in the game and it is the current
            // player we are looking at then return everything.
            if (player && p._id == player._id) {
                player.currentResearchTicksEta = this.researchService.calculateCurrentResearchETAInTicks(doc, player);

                player.research.scanning.effective = effectiveTechs.scanning;
                player.research.hyperspace.effective = effectiveTechs.hyperspace;
                player.research.terraforming.effective = effectiveTechs.terraforming;
                player.research.experimentation.effective = effectiveTechs.experimentation;
                player.research.weapons.effective = effectiveTechs.weapons;
                player.research.banking.effective = effectiveTechs.banking;
                player.research.manufacturing.effective = effectiveTechs.manufacturing;

                delete p.notes; // Don't need to send this back.
                delete p.lastSeenIP; // Super sensitive data.

                return p;
            }

            if (!displayOnlineStatus) {
                p.lastSeen = null;
                p.isOnline = null;
            } else {
                // Work out whether the player is online.
                let onlinePlayers = this.broadcastService.getOnlinePlayers(doc);
                
                p.isOnline = (player && p._id == player._id) 
                    || onlinePlayers.find(op => op._id.equals(p._id)) != null;
            }

            let reputation = null;

            if (player) {
                reputation = this.reputationService.getReputation(doc, p, player);
            }

            // Return a subset of the user, key info only.
            return {
                colour: p.colour,
                shape: p.shape,
                research: {
                    scanning: { 
                        level: p.research.scanning.level,
                        effective: effectiveTechs.scanning
                    },
                    hyperspace: { 
                        level: p.research.hyperspace.level,
                        effective: effectiveTechs.hyperspace
                    },
                    terraforming: { 
                        level: p.research.terraforming.level,
                        effective: effectiveTechs.terraforming
                    },
                    experimentation: { 
                        level: p.research.experimentation.level,
                        effective: effectiveTechs.experimentation
                    },
                    weapons: { 
                        level: p.research.weapons.level,
                        effective: effectiveTechs.weapons
                    },
                    banking: { 
                        level: p.research.banking.level,
                        effective: effectiveTechs.banking
                    },
                    manufacturing: { 
                        level: p.research.manufacturing.level,
                        effective: effectiveTechs.manufacturing
                    }
                },
                isEmptySlot: p.userId == null, // Do not send the user ID back to the client.
                isInScanningRange: p.isInScanningRange,
                defeated: p.defeated,
                afk: p.afk,
                ready: p.ready,
                _id: p._id,
                alias: p.alias,
                avatar: p.avatar,
                homeStarId: p.homeStarId,
                stats: p.stats,
                reputation,
                lastSeen: p.lastSeen,
                isOnline: p.isOnline,
                guild: playerGuild,
                hasDuplicateIP: p.hasDuplicateIP
            };
        });
    }

    _populatePlayerHasDuplicateIPs(game) {
        for (let player of game.galaxy.players) {
            player.hasDuplicateIP = this.playerService.hasDuplicateLastSeenIP(game, player);
        }
    }

    _hasGameStarted(doc) {
        return doc.state.startDate != null;
    }

    _clearPlayerCarriers(doc) {
        doc.galaxy.carriers = [];
    }

    async _maskGalaxy(game, player) {
        /*
            Masking of galaxy data occurs here, it prevent players from seeing what other
            players are doing until the tick has finished.

            This will be a combination of the current state of the galaxy for the player and
            the previous tick's galaxy data for other players.

            The following logic will be applied to the galaxy:
            1. Apply previous tick's data to all STARS the player does not own.
                - Garrison, specialist, warp gate and infrastructure needs to be reset.
            2. Apply previous tick's data to all CARRIERS the player does not own.
                - Remove any carriers that exist in the current tick but not in the previous tick.
                - Ships, specialist and gift status needs to be reset.
            3. Continue to run through current logic as we do today.

            Note: We do not reset other player data for the previous tick.
        
            Things to consider:
            - What gets displayed in the event log? Are there any events that are visible in the current tick that apply to other players?
            - We need to remove any realtime updates when players perform actions in the current tick which need to be masked.
        */

        if (!this.gameService.isStarted(game) || game.state.tick === 0) {
            return;
        }

        let history = await this.historyService.getHistoryByTick(game._id, game.state.tick);

        if (!history) {
            return;
        }
        
        // Apply previous tick's data to all STARS the player does not own.
        for (let i = 0; i < game.galaxy.stars.length; i++) {
            let gameStar = game.galaxy.stars[i];
            
            if (player && gameStar.ownedByPlayerId && gameStar.ownedByPlayerId.equals(player._id)) {
                continue;
            }
            
            let historyStar = history.stars.find(x => x.starId.equals(gameStar._id));

            gameStar.ownedByPlayerId = historyStar.ownedByPlayerId;
            gameStar.naturalResources = historyStar.naturalResources;
            gameStar.garrison = historyStar.garrison;
            gameStar.specialistId = historyStar.specialistId;
            gameStar.warpGate = historyStar.warpGate;
            gameStar.infrastructure = historyStar.infrastructure;
        }

        // Apply previous tick's data to all CARRIERS the player does not own.
        for (let i = 0; i < game.galaxy.carriers.length; i++) {
            let gameCarrier = game.galaxy.carriers[i];

            if (player && gameCarrier.ownedByPlayerId.equals(player._id)) {
                continue;
            }

            let historyCarrier = history.carriers.find(x => x.carrierId.equals(gameCarrier._id));

            // Remove any carriers that exist in the current tick but not in the previous tick.
            if (!historyCarrier) {
                game.galaxy.carriers.splice(i, 1);
                i--;
                continue;
            }
            
            gameCarrier.ownedByPlayerId = historyCarrier.ownedByPlayerId;
            gameCarrier.orbiting = historyCarrier.orbiting;
            gameCarrier.inTransitFrom = historyCarrier.inTransitFrom;
            gameCarrier.inTransitTo = historyCarrier.inTransitTo;
            gameCarrier.ships = historyCarrier.ships;
            gameCarrier.specialistId = historyCarrier.specialistId;
            gameCarrier.isGift = historyCarrier.isGift;
            gameCarrier.location = historyCarrier.location;
        }
    }

};
