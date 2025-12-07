import moment, {type Moment} from 'moment'
import DiplomacyHelper from './diplomacyHelper.js'
import type {Carrier, Game, Player, Star} from "../types/game";
import type {GameStateDetail, Location, MapObject, Team} from '@solaris-common';
import type {RulerPoint} from '@/types/ruler';

class GameHelper {
  getUserPlayer(game: Game): Player | undefined {
    // The user's player will be the only player that has a user ID on the player object.
    return game.galaxy.players.find(p => p.userId)
  }

  getColourMapping(game: Game) {
    const userPlayer = this.getUserPlayer(game);

    // spectating
    if (!userPlayer) {
      return {};
    }

    if (userPlayer.colourMapping) {
      return userPlayer.colourMapping;
    } else {
      userPlayer.colourMapping = new Map();
      return userPlayer.colourMapping;
    }
  }

  getPlayerByAlias(game: Game, playerName: string) {
    return game.galaxy.players.find(p => p.alias === playerName)
  }

  getPlayerById(game: Game, playerId: string) {
    return game.galaxy.players.find(x => x._id === playerId)
  }

  getFriendlyColour(colour: string) {
    return colour.replace('0x', '#').toLowerCase();
  }

  getStarByName(game: Game, starName: string) {
    return game.galaxy.stars.find(s => s.name === starName)
  }

  getStarById(game: Game, starId: string): Star | undefined {
    return game.galaxy.stars.find(x => x._id === starId)
  }

  getCarrierById(game: Game, carrierId: string): Carrier | undefined {
    return game.galaxy.carriers.find(x => x._id === carrierId)
  }

  getActionById(game: Game, actionId: string) {
    const player = this.getUserPlayer(game)!;
    return player.scheduledActions.find(a => a._id === actionId);
  }

  getStarOwningPlayer(game: Game, star: Star) {
    return game.galaxy.players.find(x => x._id === star.ownedByPlayerId)
  }

  getStarsOwnedByPlayer(player: Player, stars: Star[]) {
    if (player == null) {
      return [];
    }

    return stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId === player._id)
  }

  getPlayerHomeStar(player: Player, stars: Star[]) {
    return stars.find(s => s._id === player.homeStarId)
  }

  getCarrierOwningPlayer(game: Game, carrier: Carrier) {
    return game.galaxy.players.find(x => x._id === carrier.ownedByPlayerId)
  }

  isOwnedByUserPlayer(game: Game, carrierOrStar: MapObject<string>) {
    const userPlayer = this.getUserPlayer(game)!;

    return userPlayer && carrierOrStar.ownedByPlayerId === userPlayer._id;
  }

  getCarrierOrbitingStar(game: Game, carrier: Carrier) {
    return game.galaxy.stars.find(x => x._id === carrier.orbiting) || null
  }

  getCarriersOrbitingStar(game: Game, star: Star) {
    return game.galaxy.carriers
      .filter(x => x.orbiting === star._id)
      .sort((a, b) => (a.ticksEta || 0) - (b.ticksEta || 0))
  }

  isCarrierInTransit(carrier: Carrier) {
    return carrier.orbiting == null;
  }

  isCarrierInTransitToWaypoint(carrier: Carrier, waypoint) {
    return carrier.waypoints.indexOf(waypoint) === 0 && this.isCarrierInTransit(carrier)
  }

  getStarTotalKnownShips(game, star) {
    let carriers = this.getCarriersOrbitingStar(game, star)

    return (star.ships || 0) + carriers.reduce((sum, c) => sum + (c.ships || 0), 0)
  }

  getHyperspaceDistance(game, player, carrier) {
    return ((carrier.effectiveTechs.hyperspace || 1) + 1.5) * game.constants.distances.lightYear
  }

  getScanningLevelByDistance(game, distance) {
    let distancePerLevel = Math.ceil(distance / game.constants.distances.lightYear - 1)
    return distancePerLevel || 1
  }

  getHyperspaceLevelByDistance(game, distance) {
    let distancePerLevel = Math.ceil(distance / game.constants.distances.lightYear - 1.5)

    return distancePerLevel || 1
  }

  getDistanceBetweenLocations(loc1, loc2) {
    return Math.hypot(loc2.x - loc1.x, loc2.y - loc1.y);
  }

  getClosestStar(stars, point) {
    let closestStar = stars[0]
    let smallerDistance = Number.MAX_VALUE

    for (let star of stars) {
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

  getClosestPlayerStar(stars: Star[], point: Location, player: Player) {
    let closestStar = stars[0];
    let smallerDistance = Number.MAX_VALUE;

    const playerStars = this.getStarsOwnedByPlayer(player, stars);

    for (let star of playerStars) {
      const distance = this.getDistanceBetweenLocations(star.location, point);

      if (distance < smallerDistance) {
        smallerDistance = distance
        closestStar = star
      }
    }

    return closestStar
  }

  getAngleBetweenLocations(loc1: Location, loc2: Location) {
    return Math.atan2(loc2.y - loc1.y, loc2.x - loc1.x)
  }

  getPointFromLocation(loc: Location, angle: number, distance: number) {
    return {
      x: loc.x + (Math.cos(angle) * distance),
      y: loc.y + (Math.sin(angle) * distance)
    }
  }

  isInstantTravel(prev: RulerPoint, curr: RulerPoint) {
    if (prev.type === 'star' && curr.type === 'star') {
      const prevObj = prev.object as Star;
      const currObj = curr.object as Star;

      return prevObj.wormHoleToStarId === currObj._id && currObj.wormHoleToStarId === prevObj._id;
    }

    return false;
  }

  getTickDistance(game: Game, carrier: Carrier, tickDistanceModifier = 1) {
    let tickDistance = game.settings.specialGalaxy.carrierSpeed * tickDistanceModifier

    // Factor in any local speed modifers
    if (carrier && carrier.specialist && carrier.specialist.modifiers.local) {
      tickDistance *= carrier.specialist.modifiers.local.speed || 1
    }

    return tickDistance;
  }

  getCarrierSpeed(game: Game, player: Player, carrier: Carrier, source: Star | null, destination: Star | null) {
    const ly = game.constants.distances.lightYear;

    if (carrier.waypoints.length === 0) {
      return 'not moving';
    }

    const instantSpeed = this.isStarPairWormHole(source, destination);

    if (instantSpeed) {
      return 'instant';
    }

    if (!source || !destination) {
      return 'unknown';
    }

    const canWarpSpeed = this.canTravelAtWarpSpeed(game, player, carrier, source, destination);
    const speed = this.getTickDistance(game, carrier, canWarpSpeed ? game.constants.distances.warpSpeedMultiplier : 1);
    const speedLy = speed / ly;

    return `${speedLy}LY/tick`;
  }

  getTicksBetweenLocations(game: Game, carrier: Carrier, locs: RulerPoint[], tickDistanceModifier = 1) {
    let totalTicks = 0
    const tickDistance = this.getTickDistance(game, carrier, tickDistanceModifier);

    for (let i = 1; i < locs.length; i++) {
      const prevLoc = locs[i - 1]
      const currLoc = locs[i]
      const distance = this.getDistanceBetweenLocations(prevLoc.location, currLoc.location)

      let ticks: number;

      // Check for worm holes
      if (this.isInstantTravel(prevLoc, currLoc)) {
        ticks = 1
      } else {
        // fix here

        ticks = 1;
        let remainingDistance = distance;

        while (remainingDistance > tickDistance) {
          remainingDistance -= tickDistance;
          ticks++;
        }
      }

      totalTicks += ticks
    }

    return totalTicks
  }

  getActualTicksBetweenLocations(game, player, carrier, sourceStar, destinationStar, hyperspaceDistance) {
    const instantSpeed = this.isStarPairWormHole(sourceStar, destinationStar)

    if (instantSpeed) {
      return 1 // 1 tick for worm hole pairs
    }

    // If the carrier is within hyperspace range and can travel at warp speed, then return the warp speed ticks
    // otherwise return the normal speed
    const distanceBetweenStars = this.getDistanceBetweenLocations(sourceStar.location, destinationStar.location)

    const isInHyperspaceRange = distanceBetweenStars <= hyperspaceDistance
    const canWarpSpeed = this.canTravelAtWarpSpeed(game, player, carrier, sourceStar, destinationStar)

    if (isInHyperspaceRange && canWarpSpeed) {
      return this.getTicksBetweenLocations(game, carrier, [sourceStar, destinationStar], game.constants.distances.warpSpeedMultiplier)
    }

    return this.getTicksBetweenLocations(game, carrier, [sourceStar, destinationStar])
  }

  getTicksToProduction(game: Game, currentTick, currentProductionTick) {
    let productionTicks = game.settings.galaxy.productionTicks

    return ((currentProductionTick + 1) * productionTicks) - currentTick
  }

  getCountdownTime(game: Game, date) {
    if (date == null) {
      return 'Unknown'
    }

    let relativeTo = moment().utc()
    // Deduct the future date from now.
    return moment(date).utc().clone().diff(relativeTo)
  }

  getCountdownTimeString(game: Game, date, largestUnitOnly = false) {
    if (date == null) {
      return 'Unknown'
    }

    if (this.isGameFinished(game)) {
      return 'N/A'
    }

    let t = this.getCountdownTime(game, date)

    return this.getDateToString(t, largestUnitOnly)
  }

  getCountdownTimeStringByTicksWithTickETA(game: Game, ticks: number, useNowDate = false, largestUnitOnly = false) {
    const str = this.getCountdownTimeStringByTicks(game, ticks, useNowDate, largestUnitOnly);

    if (game.settings.gameTime.gameType === 'realTime') {
      return `${str} - Tick ${game.state.tick + ticks}`
    }

    return str
  }

  getCountdownTimeStringByTicks(game, ticks, useNowDate = false, largestUnitOnly = false) {
    if (game == null) {
      return ''
    }

    if (game.settings.gameTime.gameType === 'realTime' && !this.isGameFinished(game)) {
      const date = useNowDate ? moment().utc() : game.state.lastTickDate

      const timeRemainingEtaDate = this.calculateTimeByTicks(ticks, game.settings.gameTime.speed, date)

      return this.getCountdownTimeString(game, timeRemainingEtaDate, largestUnitOnly)
    }

    return `${ticks} ticks`
  }

  getDateToString(date, largestUnitOnly = false) {
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

  getCountdownTimeForProductionCycle(game) {
    const ticksToProduction = this.getTicksToProduction(game, game.state.tick, game.state.productionTick);

    return this.calculateTimeByTicks(ticksToProduction, game.settings.gameTime.speed, game.state.lastTickDate);
  }

  getCountdownTimeForTurnTimeout(game) {
    return moment(game.state.lastTickDate).utc().add('minutes', game.settings.gameTime.maxTurnWait)
  }

  getCountdownTimeStringForTurnTimeout(game) {
    return this.getCountdownTimeString(game, this.getCountdownTimeForTurnTimeout(game))
  }

  // TODO: This has all been copy/pasted from the API services
  // is there a way to share these functions in a core library?
  calculateWaypointTicks(game: Game, carrier: Carrier, waypoint) {
    const delayTicks = waypoint.delayTicks || 0

    const carrierOwner = this.getPlayerById(game, carrier.ownedByPlayerId!)!;

    // if the waypoint is going to the same star then it is at least 1
    // tick, plus any delay ticks.
    if (waypoint.source === waypoint.destination) {
      return 1 + delayTicks
    }

    const sourceStar = this.getStarById(game, waypoint.source)!;
    const destinationStar = this.getStarById(game, waypoint.destination)!;

    // If the carrier can travel instantly then it'll take 1 tick + any delay.
    const instantSpeed = Boolean(sourceStar && this.isStarPairWormHole(sourceStar, destinationStar));

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

  calculateTimeByTicks(ticks, speedInSeconds, relativeTo: Moment | null = null) {
    if (relativeTo == null) {
      relativeTo = moment().utc()
    } else {
      relativeTo = moment(relativeTo).utc()
    }

    return relativeTo.add(ticks * speedInSeconds, 'seconds')
  }

  canTravelAtWarpSpeed(game: Game, player: Player, carrier: Carrier, sourceStar: Star | null, destinationStar: Star | null) {
    // Double check for destroyed stars.
    if (sourceStar == null || destinationStar == null) {
      return false
    }

    // If both stars have warp gates and they are both owned by players...
    if (sourceStar.warpGate && destinationStar.warpGate && sourceStar.ownedByPlayerId && destinationStar.ownedByPlayerId) {
      // If both stars are owned by the player or by allies then carriers can always move at warp.
      let sourceAllied = sourceStar.ownedByPlayerId === carrier.ownedByPlayerId || (DiplomacyHelper.isFormalAlliancesEnabled(game) && DiplomacyHelper.isDiplomaticStatusToPlayersAllied(game, sourceStar.ownedByPlayerId, [carrier.ownedByPlayerId!]))
      let desinationAllied = destinationStar.ownedByPlayerId === carrier.ownedByPlayerId || (DiplomacyHelper.isFormalAlliancesEnabled(game) && DiplomacyHelper.isDiplomaticStatusToPlayersAllied(game, destinationStar.ownedByPlayerId, [carrier.ownedByPlayerId!]))

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

  canLoop(game, player, carrier) {
    if (carrier.waypoints.length < 2 || carrier.isGift) {
      return false
    }

    // TODO: Calculate effective techs for the carrier. Need to find a way to share this
    // logic with the server.

    // Check whether the last waypoint is in range of the first waypoint.
    let firstWaypoint = carrier.waypoints[0]
    let lastWaypoint = carrier.waypoints[carrier.waypoints.length - 1]

    let firstWaypointStar = this.getStarById(game, firstWaypoint.destination)
    let lastWaypointStar = this.getStarById(game, lastWaypoint.destination)

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

  isStarPairWormHole(sourceStar: Star | null, destinationStar: Star | null) {
    return sourceStar
      && destinationStar
      && sourceStar.wormHoleToStarId
      && destinationStar.wormHoleToStarId
      && sourceStar.wormHoleToStarId === destinationStar._id
      && destinationStar.wormHoleToStarId === sourceStar._id
  }

  isGameWaitingForPlayers(game) {
    return game.state.startDate == null
  }

  isGamePaused(game) {
    return game.state.paused
  }

  isGameNotStarted(game) {
    return !game.state.startDate
  }

  isGameStarted(game) {
    return game.state.startDate != null
  }

  isGameInProgress(game) {
    return !this.isGameWaitingForPlayers(game) && !this.isGamePaused(game) && game.state.startDate != null && moment().utc().diff(game.state.startDate) >= 0 && !game.state.endDate
  }

  isGamePendingStart(game) {
    return !this.isGameWaitingForPlayers(game) && !this.isGamePaused(game) && game.state.startDate != null && moment().utc().diff(game.state.startDate) < 0
  }

  isGameFinished(game: GameStateDetail<string>) {
    return game.state.endDate != null;
  }

  isDarkModeExtra(game) {
    return game.settings.specialGalaxy.darkGalaxy === 'extra'
  }

  isDarkMode(game) {
    return (game.settings.specialGalaxy.darkGalaxy === 'standard' || game.settings.specialGalaxy.darkGalaxy === 'extra') ||
      (game.settings.specialGalaxy.darkGalaxy === 'start' && game.state.startDate == null)
  }

  isDarkFogged(game) {
    return game.settings.specialGalaxy.darkGalaxy === 'fog'
  }

  isTradeEnabled(game) {
    return game.settings.player.tradeCredits || game.settings.player.tradeCreditsSpecialists || game.settings.player.tradeCost
  }

  isOrbitalMechanicsEnabled(game) {
    return game.settings.orbitalMechanics.enabled === 'enabled'
  }

  isConquestAllStars(game) {
    return game.settings.general.mode === 'conquest' && game.settings.conquest.victoryCondition === 'starPercentage'
  }

  isWinConditionHomeStars(game) {
    return game.settings.conquest.victoryCondition === 'homeStarPercentage';
  }

  isWinConditionStarCount(game) {
    return game.settings.conquest.victoryCondition === 'starPercentage';
  }

  isConquestHomeStars(game) {
    return game.settings.general.mode === 'conquest' && game.settings.conquest.victoryCondition === 'homeStarPercentage'
  }

  isCapitalElimination(game) {
    return game.settings.conquest.capitalStarElimination === 'enabled';
  }

  isKingOfTheHillMode(game) {
    return game.settings.general.mode === 'kingOfTheHill'
  }

  isTutorialGame(game) {
    return game.settings.general.type === 'tutorial'
  }

  isSpectatingEnabled(game) {
    return game.settings.general.spectators === 'enabled'
  }

  isTeamConquest(game) {
    return Boolean(game.settings.general.mode === 'teamConquest')
  }
  getGameStatusText(game) {
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

  isOwnerCapital(game, star) {
    if (!star.homeStar || !star.ownedByPlayerId) {
      return false;
    }

    const ownersHomeStarId = this.getPlayerById(game, star.ownedByPlayerId)!.homeStarId;

    return ownersHomeStarId && ownersHomeStarId === star._id;
  }

  getOriginalOwner(game, star) {
    return game.galaxy.players.find(player => player.homeStarId == star._id);
  }

  isRedCapital(game, star) {
    if (!star.homeStar || !star.ownedByPlayerId) {
      return false;
    }

    if (this.isConquestHomeStars(game)) {
      return true;
    }

    const player = this.getPlayerById(game, star.ownedByPlayerId)!
    if (this.isCapitalElimination(game) && this.isOwnerCapital(game, star) && !player.defeated) {
      return true;
    }

    return false;
  }

  playerHasLowestTechLevel(game: Game, techKey, player) {
    const levels: number[] = [...new Set(game.galaxy.players
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

  playerHasHighestTechLevel(game: Game, techKey, player) {
    const levels: number[] = [...new Set(game.galaxy.players
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

  userPlayerHasHighestTechLevel(game: Game, techKey) {
    const userPlayer = this.getUserPlayer(game)

    return this.playerHasHighestTechLevel(game, techKey, userPlayer)
  }

  userPlayerHasLowestTechLevel(game: Game, techKey) {
    const userPlayer = this.getUserPlayer(game)

    return this.playerHasLowestTechLevel(game, techKey, userPlayer)
  }

  getPlayerStatus(player) {
    if (player.defeated && !player.afk) {
      return 'Defeated'
    } else if (player.defeated && player.afk) {
      return 'AFK'
    }

    return 'Unknown'
  }

  getSortedLeaderboardTeamList(game) {
    const sortingKey = game.settings.conquest.victoryCondition === 'starPercentage' ? 'totalStars' : 'totalHomeStars';

    const teamsWithData = game.galaxy.teams.map(team => {
      const players = team.players.map(playerId => this.getPlayerById(game, playerId))

      players.sort((a, b) => {
        const aStars = a.stats && a.stats[sortingKey];
        const bStars = b.stats && b.stats[sortingKey];

        if (aStars > bStars) return -1;
        if (aStars < bStars) return 1;
        return 0;
      });

      let totalStars = 0;
      let totalHomeStars = 0;

      for (const player of players) {
        if (!player.stats) {
          continue;
        }

        totalStars += player.stats.totalStars || 0;
        totalHomeStars += player.stats.totalHomeStars || 0;
      }

      return {
        team,
        players,
        totalStars,
        totalHomeStars
      }
    });

    teamsWithData.sort((a, b) => {
      if (a[sortingKey] > b[sortingKey]) return -1;
      if (a[sortingKey] < b[sortingKey]) return 1;

      return 0;
    });

    return teamsWithData;
  }

  getSortedLeaderboardPlayerList(game: Game) {
    // Sort by total number of stars, then by total ships, then by total carriers.
    // Note that this sorting is different from the server side sorting as
    // on the UI we want to preserve defeated player positions relative to how many
    // stars they have as long as the game is in progress.
    let playerStats = [...game.galaxy.players]

    const sortPlayers = (a, b) => {
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
    }

    if (this.isGameFinished(game)) {
      // Sort the undefeated players first.
      let undefeatedLeaderboard = playerStats
        .filter(x => !x.defeated)
        .sort(sortPlayers);

      // Sort the defeated players next.
      let defeatedLeaderboard = playerStats
        .filter(x => x.defeated)
        .sort(sortPlayers);

      // Join both sorted arrays together to produce the leaderboard.
      return undefeatedLeaderboard.concat(defeatedLeaderboard);
    } else {
      return playerStats.sort(sortPlayers)
    }
  }

  isNormalAnonymity(game) {
    return game.settings.general.anonymity === 'normal'
  }

  isExtraAnonymity(game) {
    return game.settings.general.anonymity === 'extra'
  }

  isHiddenPlayerOnlineStatus(game) {
    return game.settings.general.playerOnlineStatus === 'hidden'
  }

  isPlayerOnline(player) {
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

  getOnlineStatus(player) {
    if (player.isOnline == null || player.lastSeen == null) {
      return ''
    }
    else if (player.isOnline) {
      return 'Online Now'
    }
    else {
      return moment(player.lastSeen).utc().fromNow()
    }
  }

  calculateGalaxyCenterX(game: Game): number {
    const starFieldLeft = this.calculateMinStarX(game)
    const starFieldRight = this.calculateMaxStarX(game)
    return starFieldLeft + ((starFieldRight - starFieldLeft) / 2.0)
  }

  calculateGalaxyCenterY(game: Game): number {
    const starFieldTop = this.calculateMinStarY(game)
    const starFieldBottom = this.calculateMaxStarY(game)
    return starFieldTop + ((starFieldBottom - starFieldTop) / 2.0)
  }

  calculateMinStarX(game: Game): number {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.x - b.location.x)[0].location.x
  }

  calculateMinStarY(game: Game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.y - b.location.y)[0].location.y
  }

  calculateMaxStarX(game: Game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.x - a.location.x)[0].location.x
  }

  calculateMaxStarY(game: Game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.y - a.location.y)[0].location.y
  }

  calculateMinCarrierX(game: Game) {
    if (!game.galaxy.carriers.length) { return 0 }

    return game.galaxy.carriers.sort((a, b) => a.location.x - b.location.x)[0].location.x
  }

  calculateMinCarrierY(game: Game) {
    if (!game.galaxy.carriers.length) { return 0 }

    return game.galaxy.carriers.sort((a, b) => a.location.y - b.location.y)[0].location.y
  }

  calculateMaxCarrierX(game: Game) {
    if (!game.galaxy.carriers.length) { return 0 }

    return game.galaxy.carriers.sort((a, b) => b.location.x - a.location.x)[0].location.x
  }

  calculateMaxCarrierY(game: Game) {
    if (!game.galaxy.carriers.length) { return 0 }

    return game.galaxy.carriers.sort((a, b) => b.location.y - a.location.y)[0].location.y
  }

  isSpecialistsEnabled(game: Game) {
    return game.settings.specialGalaxy.specialistCost !== 'none'
  }

  isSpecialistsTechnologyEnabled(game: Game) {
    return game.settings.technology.researchCosts.specialists !== 'none'
  }

  isSpecialistsCurrencyCredits(game: Game) {
    return this.isSpecialistsEnabled(game) && game.settings.specialGalaxy.specialistsCurrency === 'credits'
  }

  isSpecialistsCurrencyCreditsSpecialists(game: Game) {
    return this.isSpecialistsEnabled(game) && game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'
  }

  getDateString(date) {
    date = moment(date).utc().toDate()

    let dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    let monthOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return `${dayOfWeek[date.getDay()]} ${date.getDate()} ${monthOfYear[date.getMonth()]} ${date.getHours() < 10 ? '0' + date.getHours() : date.getHours()}:${date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()}`
  }

  // For placing items on a player territory (e.g. their name). Will return null if player has no territory
  getPlayerTerritoryCenter(game: Game, player: Player) {
    const playerStars = this.getStarsOwnedByPlayer(player, game.galaxy.stars)

    if (!playerStars.length) {
      return null
    }

    // Work out the center point of player stars
    const centerX = playerStars.reduce((sum, s) => sum + s.location.x, 0) / playerStars.length
    const centerY = playerStars.reduce((sum, s) => sum + s.location.y, 0) / playerStars.length

    let closestStar = this.getClosestPlayerStar(game.galaxy.stars, { x: centerX, y: centerY }, player)

    return closestStar.location
  }

  getGamePlayerShapesCount(game) {
    return new Set([...game.galaxy.players.map(p => p.shape)]).size
  }

  isRealTimeGame(game) {
    return game.settings.gameTime.gameType === 'realTime';
  }

  isTurnBasedGame(game) {
    return game.settings.gameTime.gameType === 'turnBased';
  }

  is1v1Game(game) {
    return ['1v1_rt', '1v1_tb'].includes(game.settings.general.type)
  }

  listAllUndefeatedPlayers(game) {
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

  gameHasOpenSlots(game) {
    if (this.isGameFinished(game)) {
      return false
    }

    return game.galaxy.players.filter(p => p.isOpenSlot).length > 0
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

  starInfrastructureUpgraded(game: Game, data) {
    let userPlayer = this.getUserPlayer(game)!;

    userPlayer.credits -= data.cost

    if (data.currentResearchTicksEta != null) {
      userPlayer.currentResearchTicksEta = data.currentResearchTicksEta
    }

    if (data.nextResearchTicksEta != null) {
      userPlayer.nextResearchTicksEta = data.nextResearchTicksEta
    }

    const star = this.getStarById(game, data.starId)!;

    if (star.upgradeCosts) {
      star.upgradeCosts[data.type] = data.nextCost
    }

    star.infrastructure[data.type] = data.infrastructure

    if (data.manufacturing) {
      let manufacturingDifference = +data.manufacturing - (star.manufacturing || 0);

      star.manufacturing = +data.manufacturing.toFixed(2)

      userPlayer.stats!.newShips = +(userPlayer.stats!.newShips + manufacturingDifference).toFixed(2)
    }

    switch (data.type) {
      case 'economy':
        userPlayer.stats!.totalEconomy++
        break;
      case 'industry':
        userPlayer.stats!.totalIndustry++
        break;
      case 'science':
        userPlayer.stats!.totalScience += game.constants.research.sciencePointMultiplier * (star.specialistId === 11 ? 2 : 1); // Research Station
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

  isInGuild(guild, userId) {
    return guild.members.find(m => m._id === userId)
      || guild.officers.find(m => m._id === userId)
      || (guild.leader && guild.leader._id === userId)
  }

  isUserSpectatingGame(game) {
    return !this.getUserPlayer(game) // If the user isn't in the game then they are spectating
  }

  _getBankingCredits(game: Game, player: Player) {
    const bankingEnabled = game.settings.technology.startingTechnologyLevel['banking'] > 0

    if (!bankingEnabled || !player.stats!.totalStars || !player.research || !player.research.banking) {
      return 0
    }

    const bankingLevel = player.research.banking.level
    const multiplier = game.constants.player.bankingCycleRewardMultiplier

    switch (game.settings.technology.bankingReward) {
      case 'standard':
        return Math.round((bankingLevel * multiplier) + (0.15 * bankingLevel * player.stats!.totalEconomy))
      case 'legacy':
        return bankingLevel * multiplier
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

  calculateIncomeMinusUpkeep(game, player) {
    const fromEconomy = player.stats.totalEconomy * 10
    return fromEconomy + this._getBankingCredits(game, player)
  }

  calculateIncome(game, player) {
    const fromEconomy = player.stats.totalEconomy * 10
    const upkeep = this._getUpkeepCosts(game, player);
    return fromEconomy - upkeep + this._getBankingCredits(game, player);
  }

  calculateTickIncome(game, player) {
    let stars = this.getStarsOwnedByPlayer(player, game.galaxy.stars).filter(s => s.specialistId === 12); // Financial Analyst

    let creditsPerTickByScience = stars[0]?.specialist?.modifiers?.special?.creditsPerTickByScience ?? 0;

    return (stars.reduce((totalScience, star) => totalScience + (star.infrastructure?.science ?? 0), 0)) * creditsPerTickByScience;
  }

  isStarHasMultiplePlayersInOrbit(game, star) {
    let carriersInOrbit = this.getCarriersOrbitingStar(game, star)
    let playerIds = [...new Set(carriersInOrbit.map(c => c.ownedByPlayerId))]

    if (playerIds.indexOf(star.ownedByPlayerId) > -1) {
      playerIds.splice(playerIds.indexOf(star.ownedByPlayerId), 1)
    }

    return playerIds.length
  }

  getGameTypeFriendlyText(game) {
    return {
      'tutorial': 'Tutorial',
      'new_player_rt': 'New Players',
      'standard_rt': 'Standard',
      'standard_tb': 'Standard - TB',
      '1v1_rt': '1 vs. 1',
      '1v1_tb': '1 vs. 1 - TB',
      '32_player_rt': '32 Players',
      '16_player_relaxed': '16 Players - Relaxed',
      'custom': 'Custom',
      'special_dark': 'Dark Galaxy',
      'special_fog': 'Fogged Galaxy',
      'special_ultraDark': 'Ultra Dark Galaxy',
      'special_orbital': 'Orbital',
      'special_battleRoyale': 'Battle Royale',
      'special_homeStar': 'Capital Stars',
      'special_homeStarElimination': 'Elimination',
      'special_anonymous': 'Anonymous',
      'special_kingOfTheHill': 'King Of The Hill',
      'special_tinyGalaxy': 'Tiny Galaxy',
      'special_freeForAll': 'Free For All',
      'special_arcade': 'Arcade',
      'standard_team': 'Standard Team',
    }[game.settings.general.type]
  }

  isNewPlayerGame(game) {
    return ['new_player_rt', 'new_player_tb'].includes(game.settings.general.type)
  }

  isCustomGame(game) {
    return game.settings.general.type === 'custom'
  }

  isFluxGame(game) {
    return game.settings.general.fluxEnabled === 'enabled'
  }

  isFeaturedGame(game) {
    return game.settings.general.featured === true
  }

  getLedgerGameEventPlayerSummary(game, gameEvent) {
    const debtor = this.getPlayerById(game, gameEvent.data.debtorPlayerId)
    const creditor = this.getPlayerById(game, gameEvent.data.creditorPlayerId)
    const isCreditor = this.getUserPlayer(game) == creditor

    return {
      debtor,
      creditor,
      isCreditor
    }
  }

  calculateCombatEventShipCount(star, carriers, key) {
    let array = star ? carriers.concat([star]) : carriers //Add the star if we need to

    let unscrambled = array.filter(c => c[key] !== '???')
    let scrambled = array.filter(c => c[key] === '???')

    if (scrambled.length === unscrambled.length) return '???' //If everything is scrambled, the total is scrambled.

    let result = unscrambled.reduce((sum, c) => sum + c[key], 0).toString() //Add up all the ships

    if (scrambled.length) { //If any carriers are scramled, add a *
      result += '*'
    }

    return result
  }

  isPopulationCapped(game) {
    return game.settings.player.populationCap.enabled === 'enabled'
  }

  isGameAllowAbandonStars(game) {
    return game.settings.player.allowAbandonStars === 'enabled'
  }

  getTeamByPlayer(game, player) {
    if (!game.galaxy.teams) {
      return null;
    }

    return game.galaxy.teams.find(t => t.players.includes(player._id));
  }

  getTeamById(game: Game, teamId: string): Team<string> | undefined {
    if (!game.galaxy.teams) {
      return undefined;
    }

    return game.galaxy.teams.find(t => t._id === teamId);
  }

  calculateTicksToBonusShip(shipsActual: number | undefined, manufacturing: number | undefined) {
    if (shipsActual == null || manufacturing == null || manufacturing < 0) {
      return null;
    }

    if (Number.isInteger(manufacturing)) {
      return 'n/a';
    }

    const partialManufacturing: number = manufacturing - Math.floor(manufacturing);
    const next: number =  Math.floor(shipsActual) + 1;

    let count: number = 0;

    while (shipsActual < next) {
      count++;
      shipsActual += partialManufacturing;
    }

    return count;
  }
}

export default new GameHelper()
