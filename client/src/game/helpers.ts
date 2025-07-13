import seededRandom from 'random-seed'
import type { Carrier, Star } from "../types/game";
import { Container } from 'pixi.js'
import type { Location, UserGameSettings } from '@solaris-common';

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
}

export default new Helpers()
