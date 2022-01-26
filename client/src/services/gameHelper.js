import moment from 'moment'

class GameHelper {
  getUserPlayer (game) {
    // The user's player will be the only player that has a user ID on the player object.
    return game.galaxy.players.find(p => p.userId)
  }

  getPlayerByAlias (game, playerName) {
    return game.galaxy.players.find(p => p.alias === playerName)
  }

  getPlayerById (game, playerId) {
    return game.galaxy.players.find(x => x._id === playerId)
  }

  getPlayerColour (game, playerId) {
    let player = this.getPlayerById(game, playerId)

    return this.getFriendlyColour(player.colour.value)
  }

  getFriendlyColour (colour) {
    return colour.replace('0x', '#')
  }

  getStarByName (game, starName) {
    return game.galaxy.stars.find(s => s.name === starName)
  }

  getStarById (game, starId) {
    return game.galaxy.stars.find(x => x._id === starId)
  }

  getCarrierById (game, carrierId) {
    return game.galaxy.carriers.find(x => x._id === carrierId)
  }

  getStarOwningPlayer (game, star) {
    return game.galaxy.players.find(x => x._id === star.ownedByPlayerId)
  }

  getStarsOwnedByPlayer (player, stars) {
    return stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId === player._id)
  }

  getPlayerHomeStar (player, stars) {
    return stars.find(s => s._id === player.homeStarId)
  }

  getCarrierOwningPlayer (game, carrier) {
    return game.galaxy.players.find(x => x._id === carrier.ownedByPlayerId)
  }

  getCarrierOrbitingStar (game, carrier) {
    return game.galaxy.stars.find(x => x._id === carrier.orbiting)
  }

  getCarriersOrbitingStar (game, star) {
    return game.galaxy.carriers
      .filter(x => x.orbiting === star._id)
      .sort((a, b) => (a.ticksEta || 0) - (b.ticksEta || 0))
  }

  isCarrierInTransit (carrier) {
    return carrier.orbiting == null
  }

  isCarrierInTransitToWaypoint (carrier, waypoint) {
    return carrier.waypoints.indexOf(waypoint) === 0 && this.isCarrierInTransit(carrier)
  }

  getStarTotalKnownShips (game, star) {
    let carriers = this.getCarriersOrbitingStar(game, star)

    return (star.ships || 0) + carriers.reduce((sum, c) => sum + (c.ships || 0), 0)
  }

  getHyperspaceDistance (game, player, carrier) {
    let techLevel = player.research.hyperspace.level

    if (carrier.specialist && carrier.specialist.modifiers.local) {
      techLevel += carrier.specialist.modifiers.local.hyperspace || 0
    }

    techLevel = Math.max(1, techLevel)

    return ((techLevel || 1) + 1.5) * game.constants.distances.lightYear
  }

  getScanningLevelByDistance (game, distance) {
    let distancePerLevel = Math.ceil(distance / game.constants.distances.lightYear - 1)
    return distancePerLevel || 1
  }

  getHyperspaceLevelByDistance (game, distance) {
    let distancePerLevel = Math.ceil(distance / game.constants.distances.lightYear - 1.5)

    return distancePerLevel || 1
  }

  getDistanceBetweenLocations (loc1, loc2) {
    return Math.hypot(loc2.x - loc1.x, loc2.y - loc1.y);
  }
  
  getClosestStar (stars, point) {
    let closestStar = stars[0]
    let smallerDistance = Number.MAX_VALUE
    
    for(let star of stars) {
      let distance = this.getDistanceBetweenLocations(star.location, point)

      if (distance < smallerDistance) {
        smallerDistance = distance
        closestStar = star
      }
    }

    return {
      star: closestStar,
      distance: smallerDistance
    }
  }
  
  getClosestPlayerStar (stars, point, player) {
    let closestStar = stars[0]
    let smallerDistance = Number.MAX_VALUE

    let playerStars = this.getStarsOwnedByPlayer(player, stars)

    for(let star of playerStars) {
      let distance = this.getDistanceBetweenLocations(star.location, point)
      
      if (distance < smallerDistance ) {
        smallerDistance = distance
        closestStar = star
      }
    }

    return closestStar
  }

  getAngleBetweenLocations (loc1, loc2) {
    return Math.atan2(loc2.y - loc1.y, loc2.x - loc1.x)
  }

  getPointFromLocation (loc, angle, distance) {
    return {
      x: loc.x + (Math.cos(angle) * distance),
      y: loc.y + (Math.sin(angle) * distance)
    }
  }

  getTicksBetweenLocations (game, carrier, locs, tickDistanceModifier = 1) {
    let totalTicks = 0
    let tickDistance = game.settings.specialGalaxy.carrierSpeed * tickDistanceModifier

    // Factor in any local speed modifers
    // TODO: Global speed modifiers.
    if (carrier && carrier.specialist && carrier.specialist.modifiers.local) {
      tickDistance *= carrier.specialist.modifiers.local.speed || 1
    }

    for (let i = 1; i < locs.length; i++) {
      let prevLoc = locs[i - 1]
      let currLoc = locs[i]

      let distance = this.getDistanceBetweenLocations(prevLoc, currLoc)

      let ticks = Math.ceil(distance / tickDistance)

      totalTicks += ticks
    }

    return totalTicks
  }

  getTicksToProduction (game, currentTick, currentProductionTick) {
    let productionTicks = game.settings.galaxy.productionTicks

    let ticksToProduction = ((currentProductionTick + 1) * productionTicks) - currentTick

    return ticksToProduction
  }

  getCountdownTime (game, date) {
    if (date == null) {
      return 'Unknown'
    }

    let relativeTo = moment().utc()
    let t = moment(date).utc() - relativeTo // Deduct the future date from now.

    return t
  }

  getCountdownTimeString (game, date, largestUnitOnly = false) {
    if (date == null) {
      return 'Unknown'
    }

    if (this.isGameFinished(game)) {
      return 'N/A'
    }

    let t = this.getCountdownTime(game, date)

    return this.getDateToString(t, largestUnitOnly)
  }

  getCountdownTimeStringByTicks (game, ticks, useNowDate = false, largestUnitOnly = false) {
    if (game == null) {
      return ''
    }
    
    if (game.settings.gameTime.gameType === 'realTime') {
      let date = useNowDate ? moment().utc() : game.state.lastTickDate

      let timeRemainingEtaDate = this.calculateTimeByTicks(ticks, game.settings.gameTime.speed, date)

      let timeRemainingEta = this.getCountdownTimeString(game, timeRemainingEtaDate, largestUnitOnly)

      return timeRemainingEta
    }

    return `${ticks} ticks`
  }

  getDateToString (date, largestUnitOnly = false) {
    let days = Math.floor(date / (1000 * 60 * 60 * 24))
    let hours = Math.floor((date % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    let mins = Math.floor((date % (1000 * 60 * 60)) / (1000 * 60))
    let secs = Math.floor((date % (1000 * 60)) / 1000)

    if (secs < 0) {
      return 'Pending...'
    }

    let str = ''
    let showDays = false
    let showHours = false

    if (days > 0) {
      str += `${days}d `
      showDays = true

      if (largestUnitOnly && hours === 0 && mins === 0 && secs === 0) {
        return str
      }
    }

    if (showDays || hours > 0) {
      str += `${hours}h `
      showHours = true

      if (largestUnitOnly && mins === 0 && secs === 0) {
        return str
      }
    }

    if (showHours || mins > 0) {
      str += `${mins}m `

      if (largestUnitOnly && secs === 0) {
        return str
      }
    }

    str += `${secs}s`

    return str
  }

  getCountdownTimeForProductionCycle (game) {
    const ticksToProduction = this.getTicksToProduction(game, game.state.tick, game.state.productionTick);
    
    return this.calculateTimeByTicks(ticksToProduction, game.settings.gameTime.speed, game.state.lastTickDate);
  }

  getCountdownTimeForTurnTimeout (game) {
    return moment(game.state.lastTickDate).utc().add('minutes', game.settings.gameTime.maxTurnWait)
  }

  getCountdownTimeStringForTurnTimeout (game) {
    return this.getCountdownTimeString(game, this.getCountdownTimeForTurnTimeout(game))
  }

  // TODO: This has all been copy/pasted from the API services
  // is there a way to share these functions in a core library?
  calculateWaypointTicks(game, carrier, waypoint) {
    const delayTicks = waypoint.delayTicks || 0

    let carrierOwner = this.getPlayerById(game, carrier.ownedByPlayerId)

    // if the waypoint is going to the same star then it is at least 1
    // tick, plus any delay ticks.
    if (waypoint.source === waypoint.destination) {
        return 1 + delayTicks
    }

    let sourceStar = this.getStarById(game, waypoint.source)
    let destinationStar = this.getStarById(game, waypoint.destination)

    // If the carrier can travel instantly then it'll take 1 tick + any delay.
    let instantSpeed = sourceStar && this.isStarPairWormHole(sourceStar, destinationStar)

    if (instantSpeed) {
        return 1 + delayTicks
    }

    let source = sourceStar == null ? carrier.location : sourceStar.location
    let destination = destinationStar.location

    // If the carrier is already en-route, then the number of ticks will be relative
    // to where the carrier is currently positioned.
    if (!carrier.orbiting && carrier.waypoints[0]._id === waypoint._id) {
        source = carrier.location
    }
    
    let distance = this.getDistanceBetweenLocations(source, destination)
    let warpSpeed = this.canTravelAtWarpSpeed(game, carrierOwner, carrier, sourceStar, destinationStar)

    // Calculate how far the carrier will move per tick.
    let tickDistance = this.getCarrierDistancePerTick(game, carrier, warpSpeed, instantSpeed)
    let ticks = 1

    if (tickDistance) {
        ticks = Math.ceil(distance / tickDistance)
    }

    ticks += delayTicks // Add any delay ticks the waypoint has.

    return ticks;
  }

  calculateWaypointTicksEta(game, carrier, waypoint) {
    let totalTicks = 0

    for (let i = 0; i < carrier.waypoints.length; i++) {
        let cwaypoint = carrier.waypoints[i]
        
        totalTicks += this.calculateWaypointTicks(game, carrier, cwaypoint)

        if (cwaypoint === waypoint) {
            break
        }
    }

    return totalTicks
  }

  calculateTimeByTicks (ticks, speedInSeconds, relativeTo = null) {
    if (relativeTo == null) {
      relativeTo = moment().utc()
    } else {
      relativeTo = moment(relativeTo).utc()
    }

    return relativeTo.add(ticks * speedInSeconds, 'seconds')
  }

  canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar) {
    // Double check for destroyed stars.
    if (sourceStar == null || destinationStar == null) {
        return false
    }

    // If both stars have warp gates and they are both owned by players...
    if (sourceStar.warpGate && destinationStar.warpGate && sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId) {
        // If both stars are owned by the player or by allies then carriers can always move at warp.
        let sourceAllied = sourceStar.ownedByPlayerId === carrier.ownedByPlayerId || (this.isFormalAlliancesEnabled(game) && this.isDiplomaticStatusToPlayersAllied(game, sourceStar.ownedByPlayerId, [carrier.ownedByPlayerId]))
        let desinationAllied = destinationStar.ownedByPlayerId === carrier.ownedByPlayerId || (this.isFormalAlliancesEnabled(game) && this.isDiplomaticStatusToPlayersAllied(game, destinationStar.ownedByPlayerId, [carrier.ownedByPlayerId]))

        // If both stars are owned by the player then carriers can always move at warp.
        if (sourceAllied && desinationAllied) {
            return true
        }

        // If one of the stars are not owned by the current player then we need to check for
        // warp scramblers.

        // But if the carrier has the warp stabilizer specialist then it can travel at warp speed no matter
        // which player it belongs to or whether the stars it is travelling to or from have locked warp gates.
        if (carrier.specialistId && carrier.specialist) {
            let carrierSpecialist = carrier.specialist
    
            if (carrierSpecialist.modifiers.special && carrierSpecialist.modifiers.special.unlockWarpGates) {
                return true
            }
        }

        // If either star has a warp scrambler present then carriers cannot move at warp.
        // Note that we only need to check for scramblers on stars that do not belong to the player.
        if (!sourceAllied && sourceStar.specialistId && sourceStar.specialist) {
            let specialist = sourceStar.specialist

            if (specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                return false
            }
        }

        if (!desinationAllied && destinationStar.specialistId && destinationStar.specialist) {
            let specialist = destinationStar.specialist

            if (specialist.modifiers.special && specialist.modifiers.special.lockWarpGates) {
                return false
            }
        }

        // If none of the stars have scramblers then warp speed ahead.
        return true
    }

    return false
  }

  getCarrierDistancePerTick(game, carrier, warpSpeed = false, instantSpeed = false) {
    if (instantSpeed) {
        return null
    }

    let distanceModifier = warpSpeed ? game.constants.distances.warpSpeedMultiplier : 1

    if (carrier.specialistId && carrier.specialist) {
        let specialist = carrier.specialist

        if (specialist.modifiers.local) {
            distanceModifier *= (specialist.modifiers.local.speed || 1)
        }
    }

    return game.settings.specialGalaxy.carrierSpeed * distanceModifier;
  }

  canLoop (game, player, carrier) {
    if (carrier.waypoints.length < 2 || carrier.isGift) {
      return false
    }
    
    // TODO: Calculate effective techs for the carrier. Need to find a way to share this
    // logic with the server.

    // Check whether the last waypoint is in range of the first waypoint.
    let firstWaypoint = carrier.waypoints[0]
    let lastWaypoint = carrier.waypoints[carrier.waypoints.length - 1]

    let firstWaypointStar = this.getStarById(game, firstWaypoint.source)
    let lastWaypointStar = this.getStarById(game, lastWaypoint.source)

    if (firstWaypointStar == null || lastWaypointStar == null) {
      return false
    }

    if (this.isStarPairWormHole(firstWaypointStar, lastWaypointStar)) {
      return true
    }

    let distanceBetweenStars = this.getDistanceBetweenLocations(firstWaypointStar.location, lastWaypointStar.location)
    let hyperspaceDistance = this.getHyperspaceDistance(game, player, carrier)

    return distanceBetweenStars <= hyperspaceDistance
  }

  isStarPairWormHole (sourceStar, destinationStar) {
    return sourceStar.wormHoleToStarId 
      && destinationStar.wormHoleToStarId 
      && sourceStar.wormHoleToStarId === destinationStar._id
      && destinationStar.wormHoleToStarId === sourceStar._id
  }

  isGameWaitingForPlayers (game) {
    return game.state.startDate == null
  }

  isGamePaused (game) {
    return game.state.paused
  }

  isGameInProgress (game) {
    return !this.isGameWaitingForPlayers(game) && !this.isGamePaused(game) && game.state.startDate != null && moment().utc().diff(game.state.startDate) >= 0 && !game.state.endDate
  }

  isGamePendingStart (game) {
    return !this.isGameWaitingForPlayers(game) && !this.isGamePaused(game) && game.state.startDate != null && moment().utc().diff(game.state.startDate) < 0
  }

  isGameFinished (game) {
    return game.state.endDate != null
  }

  isDarkModeStandard (game) {
    return game.settings.specialGalaxy.darkGalaxy === 'standard'
  }

  isDarkModeExtra (game) {
    return game.settings.specialGalaxy.darkGalaxy === 'extra'
  }

  isTradeEnabled (game) {
    return game.settings.player.tradeCredits || game.settings.player.tradeCreditsSpecialists || game.settings.player.tradeCost
  }

  isOrbitalMechanicsEnabled (game) {
    return game.settings.orbitalMechanics.enabled === 'enabled'
  }

  isConquestAllStars (game) {
    return game.settings.general.mode === 'conquest' && game.settings.conquest.victoryCondition === 'starPercentage'
  }

  isConquestHomeStars (game) {
    return game.settings.general.mode === 'conquest' && game.settings.conquest.victoryCondition === 'homeStarPercentage'
  }

  isKingOfTheHillMode (game) {
    return game.settings.general.mode === 'kingOfTheHill'
  }

  isTutorialGame (game) {
    return game.settings.general.type === 'tutorial'
  }

  getGameStatusText (game) {
    if (this.isGamePendingStart(game)) {
      return 'Waiting to start'
    }

    if (this.isGameInProgress(game)) {
      return 'In progress'
    }

    if (this.isGameFinished(game)) {
      return 'Finished'
    }

    if (this.isGamePaused(game)) {
      return 'Paused'
    }

    return 'Unknown'
  }

  playerHasLowestTechLevel (game, techKey, player) {
    const levels = [...new Set(game.galaxy.players
      .filter(p => p.research != null)
      .map(p => {
        return p.research[techKey].level
      }))]

    // If all players have the same level then nobody has the lowest.
    if (levels.length === 1) {
      return false
    }

    const minLevel = levels.sort((a, b) => a - b)[0]

    return minLevel === player.research[techKey].level
  }

  playerHasHighestTechLevel (game, techKey, player) {
    const levels = [...new Set(game.galaxy.players
      .filter(p => p.research != null)
      .map(p => {
        return p.research[techKey].level
      }))]

    // If all players have the same level then nobody has the highest.
    if (levels.length === 1) {
      return false
    }

    const maxLevel = levels.sort((a, b) => b - a)[0]

    return maxLevel === player.research[techKey].level
  }

  userPlayerHasHighestTechLevel (game, techKey) {
    const userPlayer = this.getUserPlayer(game)

    return this.playerHasHighestTechLevel(game, techKey, userPlayer)
  }

  userPlayerHasLowestTechLevel (game, techKey) {
    const userPlayer = this.getUserPlayer(game)

    return this.playerHasLowestTechLevel(game, techKey, userPlayer)
  }

  getPlayerStatus (player) {
    if (player.defeated && !player.afk) {
      return 'Defeated'
    } else if (player.defeated && player.afk) {
      return 'AFK'
    }

    return 'Unknown'
  }

  getSortedLeaderboardPlayerList (game) {
    // Sort by total number of stars, then by total ships, then by total carriers.
    // Note that this sorting is different from the server side sorting as
    // on the UI we want to preserve defeated player positions relative to how many
    // stars they have.
    return [...game.galaxy.players]
      .sort((a, b) => {
        // If its a conquest and home star victory then sort by home stars first, then by total stars.
        if (this.isConquestHomeStars(game)) {
            if (a.stats.totalHomeStars > b.stats.totalHomeStars) return -1;
            if (a.stats.totalHomeStars < b.stats.totalHomeStars) return 1;
        }

        if (this.isKingOfTheHillMode(game) && a.isKingOfTheHill !== b.isKingOfTheHill) {
          if (a.isKingOfTheHill) return -1;
          if (b.isKingOfTheHill) return 1;
        }

        // Sort by total stars descending
        if (a.stats.totalStars > b.stats.totalStars) return -1;
        if (a.stats.totalStars < b.stats.totalStars) return 1;

        // Then by total ships descending
        if (a.stats.totalShips > b.stats.totalShips) return -1
        if (a.stats.totalShips < b.stats.totalShips) return 1

        // Then by total carriers descending
        if (a.stats.totalCarriers > b.stats.totalCarriers) return -1
        if (a.stats.totalCarriers < b.stats.totalCarriers) return 1

        // Then by defeated date descending
        if (a.defeated && b.defeated) {
          if (moment(a.defeatedDate) > moment(b.defeatedDate)) return -1
          if (moment(a.defeatedDate) < moment(b.defeatedDate)) return 1
        }

        // Sort defeated players last.
        return (a.defeated === b.defeated) ? 0 : a.defeated ? 1 : -1
      })
  }

  isNormalAnonymity (game) {
    return game.settings.general.anonymity === 'normal'
  }

  isHiddenPlayerOnlineStatus (game) {
    return game.settings.general.playerOnlineStatus === 'hidden'
  }

  isPlayerOnline (player) {
    if (player.isOnline == null) {
      return false;
    }
    else if (player.isOnline) {
      return true;
    }
    else {
      return false;
    }
  }

  getOnlineStatus (player) {
    if (player.isOnline == null) {
      return ''
    }
    else if (player.isOnline) {
      return 'Online Now'
    }
    else {
      return moment(player.lastSeen).utc().fromNow()
    }
  }

  calculateGalaxyCenterX (game) {
    let starFieldLeft = this.calculateMinStarX(game)
    let starFieldRight = this.calculateMaxStarX(game)
    return starFieldLeft + ((starFieldRight - starFieldLeft) / 2.0)
  }

  calculateGalaxyCenterY (game) {
    let starFieldTop = this.calculateMinStarY(game)
    let starFieldBottom = this.calculateMaxStarY(game)
    return starFieldTop + ((starFieldBottom - starFieldTop) / 2.0)
  }

  calculateMinStarX (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.x - b.location.x)[0].location.x
  }

  calculateMinStarY (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.y - b.location.y)[0].location.y
  }

  calculateMaxStarX (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.x - a.location.x)[0].location.x
  }

  calculateMaxStarY (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.y - a.location.y)[0].location.y
  }

  calculateMinCarrierX (game) {
    if (!game.galaxy.carriers.length) { return 0 }

    return game.galaxy.carriers.sort((a, b) => a.location.x - b.location.x)[0].location.x
  }

  calculateMinCarrierY (game) {
    if (!game.galaxy.carriers.length) { return 0 }

    return game.galaxy.carriers.sort((a, b) => a.location.y - b.location.y)[0].location.y
  }

  calculateMaxCarrierX (game) {
    if (!game.galaxy.carriers.length) { return 0 }

    return game.galaxy.carriers.sort((a, b) => b.location.x - a.location.x)[0].location.x
  }

  calculateMaxCarrierY (game) {
    if (!game.galaxy.carriers.length) { return 0 }

    return game.galaxy.carriers.sort((a, b) => b.location.y - a.location.y)[0].location.y
  }
  
  isSpecialistsEnabled (game) {
    return game.settings.specialGalaxy.specialistCost !== 'none'
  }

  isSpecialistsTechnologyEnabled (game) {
    return game.settings.technology.researchCosts.specialists !== 'none'
  }

  isSpecialistsCurrencyCredits (game) {
    return this.isSpecialistsEnabled(game) && game.settings.specialGalaxy.specialistsCurrency === 'credits'
  }

  isSpecialistsCurrencyCreditsSpecialists (game) {
    return this.isSpecialistsEnabled(game) && game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'
  }

  getSpecialistName (type, specialistId) {
    if (type === 'carrier') {
      switch (specialistId) {
        case 1:
          return 'mecha-head'
        case 2:
          return 'mecha-mask'
        case 3:
          return 'android-mask'
        case 4:
          return 'hazmat-suit'
        case 5:
          return 'cyborg-face'
        case 6:
          return 'lunar-module'
        case 7:
          return 'spaceship'
        case 8:
          return 'power-generator'
        case 9:
          return 'energise'
        case 10:
          return 'afterburn'
        case 11:
          return 'strafe'
        case 12:
          return 'alien-stare'
        case 13:
          return 'pirate'
        case 14:
          return 'spoutnik'
        case 15:
          return 'starfighter'
        case 16:
          return 'rocket'
      }
    } else {
      switch (specialistId) {
        case 1:
          return 'sattelite'
        case 2:
          return 'airtight-hatch'
        case 3:
          return 'cannister'
        case 4:
          return 'defense-satellite'
        case 5:
          return 'habitat-dome'
        case 6:
          return 'techno-heart'
        case 7:
          return 'missile-pod'
        case 8:
          return 'power-generator'
        case 9:
          return 'space-suit'
        case 10:
          return 'ringed-planet'
        case 11:
          return 'observatory'
        case 12:
          return 'double-ringed-orb'
      }
    }
  }

  getDateString (date) {
    date = moment(date).utc().toDate()

    let dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    let monthOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return `${dayOfWeek[date.getDay()]} ${date.getDate()} ${monthOfYear[date.getMonth()]} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
  }

  getPlayerEmpireCenter (game, player) {
    // Get all of the player's stars.
    let playerStars = this.getStarsOwnedByPlayer(player, game.galaxy.stars)

    if (!playerStars.length) {
      return null
    }

    // Work out the center point of all stars
    let centerX = playerStars.reduce((sum, s) => sum + s.location.x, 0) / playerStars.length
    let centerY = playerStars.reduce((sum, s) => sum + s.location.y, 0) / playerStars.length

    let closestStar = this.getClosestPlayerStar(game.galaxy.stars, { x: centerX, y: centerY }, player)

    return closestStar.location
  }

  getGamePlayerShapesCount (game) {
    return new Set([...game.galaxy.players.map(p => p.shape)]).size
  }

  isRealTimeGame(game) {
    return game.settings.gameTime.gameType === 'realTime';
  }

  isTurnBasedGame(game) {
    return game.settings.gameTime.gameType === 'turnBased';
  }

  is1v1Game (game) {
    return ['1v1_rt', '1v1_tb'].includes(game.settings.general.type)
  }

  listAllUndefeatedPlayers (game) {
    let undefeatedPlayers

    if (this.isTutorialGame(game)) {
      undefeatedPlayers = game.galaxy.players.filter(p => p.userId)
    } else {
      undefeatedPlayers = game.galaxy.players.filter(p => !p.defeated)
    }

    return undefeatedPlayers
  }

  isAllUndefeatedPlayersReady(game) {
    let undefeatedPlayers = this.listAllUndefeatedPlayers(game)

    return undefeatedPlayers.filter(x => x.ready).length === undefeatedPlayers.length
  }

  isAllUndefeatedPlayersReadyToQuit(game) {
      let undefeatedPlayers = this.listAllUndefeatedPlayers(game)

      return undefeatedPlayers.filter(x => x.readyToQuit).length === undefeatedPlayers.length
  }

  gameHasOpenSlots (game) {
    if (this.isGameFinished(game)) {
      return false
    }

    return game.galaxy.players.filter(p => {
      return p.isEmptySlot || p.afk
    }).length > 0
  }

  canTick(game) {
    if (this.isGameFinished(game)) {
      return false
    }

    if (this.isAllUndefeatedPlayersReadyToQuit(game)) {
      return true
    }

    let lastTick = moment(game.state.lastTickDate).utc();
    let nextTick;

    if (this.isRealTimeGame(game)) {
        // If in real time mode, then calculate when the next tick will be and work out if we have reached that tick.
        nextTick = moment(lastTick).utc().add(game.settings.gameTime.speed, 'seconds');
    } else if (this.isTurnBasedGame(game)) {
      let isAllPlayersReady = this.isAllUndefeatedPlayersReady(game)
            
      if (isAllPlayersReady) {
        return true
      }

        nextTick = moment(lastTick).utc().add(game.settings.gameTime.maxTurnWait, 'minutes');
    } else {
        throw new Error(`Unsupported game type.`);
    }

    return nextTick.diff(moment().utc(), 'seconds') <= 0;
  }

  starInfrastructureUpgraded(game, data) {
    let userPlayer = this.getUserPlayer(game)

    userPlayer.credits -= data.cost

    if (data.currentResearchTicksEta != null) {
      userPlayer.currentResearchTicksEta = data.currentResearchTicksEta
    }

    if (data.nextResearchTicksEta != null) {
      userPlayer.nextResearchTicksEta = data.nextResearchTicksEta
    }

    let star = this.getStarById(game, data.starId)

    star.upgradeCosts[data.type] = data.nextCost
    star.infrastructure[data.type] = data.infrastructure

    if (data.manufacturing) {
      let manufacturingDifference = +data.manufacturing - star.manufacturing

      star.manufacturing = +data.manufacturing.toFixed(2)

      userPlayer.stats.newShips = +(userPlayer.stats.newShips + manufacturingDifference).toFixed(2)
    }

    switch (data.type) {
      case 'economy':
        userPlayer.stats.totalEconomy++
        break;
      case 'industry':
        userPlayer.stats.totalIndustry++
        break;
      case 'science':
        userPlayer.stats.totalScience++
        break;
    }

    return star
  }

  isDeadStar(star) {
    return star.naturalResources != null && star.naturalResources.economy <= 0 && star.naturalResources.industry <= 0 && star.naturalResources.science <= 0
  }

  isSplitResources(game) {
    return game.settings.specialGalaxy.splitResources === 'enabled';
  }

  isInGuild (guild, userId) {
    return guild.members.find(m => m._id === userId)
      || guild.officers.find(m => m._id === userId)
      || (guild.leader && guild.leader._id === userId)
  }

  isUserSpectatingGame (game) {
    return this.isGameInProgress(game) && !this.getUserPlayer(game)
  }

  _getBankingCredits (game, player) {
    const bankingEnabled = game.settings.technology.startingTechnologyLevel['banking'] > 0

    if (!bankingEnabled || !player.stats.totalStars || !player.research || !player.research.banking) {
      return 0
    }

    const bankingLevel = player.research.banking.level

    switch (game.settings.technology.bankingReward) {
      case 'standard':
          return Math.round((bankingLevel * 75) + (0.15 * bankingLevel * player.stats.totalEconomy))
      case 'legacy':
          return bankingLevel * 75
    }
  }

  _getUpkeepCosts(game, player) {
    const upkeepCosts = {
      'none': 0,
      'cheap': 1,
      'standard': 3,
      'expensive': 6
    };

    const costPerCarrier = upkeepCosts[game.settings.specialGalaxy.carrierUpkeepCost];

    if (!costPerCarrier) {
        return 0;
    }

    return player.stats.totalCarriers * costPerCarrier;
  }

  calculateIncome (game, player) {
    const fromEconomy = player.stats.totalEconomy * 10
    const upkeep = this._getUpkeepCosts(game, player);
    return fromEconomy - upkeep  + this._getBankingCredits(game, player);
  }

  isStarHasMultiplePlayersInOrbit (game, star) {
    let carriersInOrbit = this.getCarriersOrbitingStar(game, star)
    let playerIds = [...new Set(carriersInOrbit.map(c => c.ownedByPlayerId))]

    if (playerIds.indexOf(star.ownedByPlayerId) > -1) {
      playerIds.splice(playerIds.indexOf(star.ownedByPlayerId), 1)
    }
    
    return playerIds.length
  }

  getGameTypeFriendlyText (game) {
    return {
      'tutorial': 'Tutorial',
      'new_player_rt': 'New Players',
      'standard_rt': 'Standard',
      'standard_tb': 'Standard - TB',
      '1v1_rt': '1 vs. 1',
      '1v1_tb': '1 vs. 1 - TB',
      '32_player_rt': '32 Players',
      'custom': 'Custom',
      'special_dark': 'Dark Galaxy',
      'special_ultraDark': 'Ultra Dark Galaxy',
      'special_orbital': 'Orbital',
      'special_battleRoyale': 'Battle Royale',
      'special_homeStar': 'Capital Stars',
      'special_anonymous': 'Anonymous',
      'special_kingOfTheHill': 'King Of The Hill',
      'special_tinyGalaxy': 'Tiny Galaxy'
    }[game.settings.general.type]
  }

  /* Diplomacy */

  isFormalAlliancesEnabled (game) {
    return game.settings.player.alliances === 'enabled'
  }

  isDiplomaticStatusToPlayersAllied(game, playerId, toPlayerIds) {
    let playerIdA = playerId

    for (let i = 0; i < toPlayerIds.length; i++) {
        let playerIdB = toPlayerIds[i]

        let diplomaticStatus = this.getDiplomaticStatusToPlayer(game, playerIdA, playerIdB)

        if (diplomaticStatus.actualStatus === 'enemies') {
            return false
        }
    }

    return true
  }

  getDiplomaticStatusToPlayer(game, playerIdA, playerIdB) {
    if (playerIdA === playerIdB) return {
        playerIdFrom: playerIdA,
        playerIdTo: playerIdB,
        statusFrom: 'allies',
        statusTo: 'allies',
        actualStatus: 'allies'
    }

    let playerA = game.galaxy.players.find(p => p._id === playerIdA)
    let playerB = game.galaxy.players.find(p => p._id === playerIdB)

    let statusTo = 'enemies'
    let statusFrom = 'enemies'
    
    if (playerA.diplomacy) {
      statusTo = playerA.diplomacy.allies.find(x => x === playerB._id) ? 'allies' : 'enemies'
    }

    if (playerB.diplomacy) {
      statusFrom = playerB.diplomacy.allies.find(x => x === playerA._id) ? 'allies' : 'enemies'
    }

    let isAllied = statusTo === 'allies' && statusFrom === 'allies'

    let actualStatus = isAllied ? 'allies' : 'enemies'

    return {
        playerIdFrom: playerIdA,
        playerIdTo: playerIdB,
        statusFrom,
        statusTo,
        actualStatus
    }
  }

  isNewPlayerGame (game) {
    return ['new_player_rt', 'new_player_tb'].includes(game.settings.general.type)
  }
}

export default new GameHelper()
