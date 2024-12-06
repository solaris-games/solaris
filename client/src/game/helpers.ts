import seededRandom from 'random-seed'
import type {Carrier, Star} from "../types/game";
import * as PIXI from 'pixi.js'

export class Helpers {
    rotateCarrierTowardsWaypoint (carrier: Carrier, stars: Star[], graphics: PIXI.DisplayObject) {
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

    getAngleTowardsLocation (source, destination) {
      const deltaX = destination.x - source.x
      const deltaY = destination.y - source.y

      return Math.atan2(deltaY, deltaX)
    }

    calculateDepthModifier (userSettings, seed) {
        if (userSettings.map.objectsDepth === 'disabled') {
            return 1
        }

        const min = 50
        const max = 100

        const seededRNG = seededRandom.create()
        seededRNG.seed(seed)

      return (Math.floor(seededRNG.random() * (max - min + 1) + min)) / 100
    }

    calculateDepthModifiers (userSettings, seeds) {
        if (userSettings.map.objectsDepth === 'disabled') {
            return 1
        }

        const sum = seeds.reduce((a, b) => this.calculateDepthModifier(userSettings, a) + this.calculateDepthModifier(userSettings, b))
      return sum / seeds.length
    }

}

export default new Helpers()
