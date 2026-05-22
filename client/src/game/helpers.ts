import seededRandom from 'random-seed'
import type {Carrier, Game, Player, Star} from "../types/game";
import { Container } from 'pixi.js'
import {DistanceService, type Location, type UserGameSettings} from '@solaris/common';
import type {RulerPoint} from "@/types/ruler.ts";

export class Helpers {
  rotateCarrierTowardsWaypoint(carrier: Carrier, stars: Star[], graphics: Container) {
    // If the carrier has waypoints, get the first one and calculate the angle
    // between the carrier's current position and the destination.
    if (carrier.waypoints.length) {
      const waypoint = carrier.waypoints[0]
      const starDestination = stars.find(s => s._id === waypoint.destination)

      if (!starDestination) {
        const sourceStar = stars.find(s => s._id === waypoint.source)
        if (!sourceStar) {
          return
        }

        const angle = this.getAngleTowardsLocation(carrier.location, sourceStar.location)
        graphics.angle = (angle * (180 / Math.PI)) - 90
        return
      }

      const destination = starDestination.location

      const angle = this.getAngleTowardsLocation(carrier.location, destination)

      graphics.angle = (angle * (180 / Math.PI)) + 90
    }
  }

  getAngleTowardsLocation(source: Location, destination: Location) {
    const deltaX = destination.x - source.x
    const deltaY = destination.y - source.y

    return Math.atan2(deltaY, deltaX)
  }

  calculateDepthModifier(userSettings: UserGameSettings, seed: string) {
    if (userSettings.map.objectsDepth === 'disabled') {
      return 1
    }

    const min = 50
    const max = 100

    const seededRNG = seededRandom.create()
    seededRNG.seed(seed.toString())

    return (Math.floor(seededRNG.random() * (max - min + 1) + min)) / 100
  }

  calculateDepthModifiers(userSettings: UserGameSettings, seeds: string[]) {
    if (userSettings.map.objectsDepth === 'disabled') {
      return 1;
    }

    let sum = 0;

    for (let seed of seeds) {
      sum = this.calculateDepthModifier(userSettings, sum.toString()) + this.calculateDepthModifier(userSettings, seed);
    }

    return sum / seeds.length
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

  getStarById(game: Game, starId: string): Star | undefined {
    return game.galaxy.stars.find(x => x._id === starId);
  }

  getCarrierById(game: Game, carrierId: string): Carrier | undefined {
    return game.galaxy.carriers.find(x => x._id === carrierId);
  }

  getStarOwningPlayer(game: Game, star: Star) {
    return game.galaxy.players.find(x => x._id === star.ownedByPlayerId);
  }

  getStarsOwnedByPlayer(player: Player, stars: Star[]) {
    if (player == null) {
      return [];
    }

    return stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId === player._id)
  }

  getClosestPlayerStar(distanceService: DistanceService, stars: Star[], point: Location, player: Player) {
    let closestStar = stars[0];
    let smallerDistance = Number.MAX_VALUE;

    const playerStars = this.getStarsOwnedByPlayer(player, stars);

    for (let star of playerStars) {
      const distance = distanceService.getDistanceBetweenLocations(star.location, point);

      if (distance < smallerDistance) {
        smallerDistance = distance
        closestStar = star
      }
    }

    return closestStar
  }

  // For placing items on a player territory (e.g. their name). Will return null if player has no territory
  getPlayerTerritoryCenter(distanceService: DistanceService, game: Game, player: Player) {
    const playerStars = this.getStarsOwnedByPlayer(player, game.galaxy.stars)

    if (!playerStars.length) {
      return null
    }

    // Work out the center point of player stars
    const centerX = playerStars.reduce((sum, s) => sum + s.location.x, 0) / playerStars.length
    const centerY = playerStars.reduce((sum, s) => sum + s.location.y, 0) / playerStars.length

    let closestStar = this.getClosestPlayerStar(distanceService, game.galaxy.stars, { x: centerX, y: centerY }, player)

    return closestStar.location
  }

  isStarHasMultiplePlayersInOrbit(game: Game, star: Star) {
    const carriersInOrbit = this.getCarriersOrbitingStar(game, star);
    const playerIds = [...new Set(carriersInOrbit.map(c => c.ownedByPlayerId))];

    if (playerIds.indexOf(star.ownedByPlayerId) > -1) {
      playerIds.splice(playerIds.indexOf(star.ownedByPlayerId), 1);
    }

    return playerIds.length;
  }

  getCarriersOrbitingStar(game: Game, star: Star) {
    return game.galaxy.carriers
      .filter(x => x.orbiting === star._id)
      .sort((a, b) => (a.ticksEta || 0) - (b.ticksEta || 0));
  }

  getPlayerById(game: Game, playerId: string) {
    return game.galaxy.players.find(x => x._id === playerId);
  }
}

export default new Helpers()
