import * as PIXI from 'pixi.js'
import Helpers from './helpers'
import type {Carrier, Game} from "../types/game";

class OrbitalLocationLayer {
  container: PIXI.Container;
  game: Game | undefined;

    constructor () {
        this.container = new PIXI.Container()
    }

    setup (game) {
        this.game = game
    }

    clear () {
        this.container.removeChildren()
    }

    drawStar (star) {
        if (!star.locationNext) {
            return
        }

        let graphics = new PIXI.Graphics()

        let radius = 4
        let alpha = 0.2
        let starPoints = star.homeStar ? 9 : 6

        let isDeadStar = star.naturalResources != null && star.naturalResources.economy <= 0 && star.naturalResources.industry <= 0 &&star.naturalResources.science <= 0
        let fillStar = !isDeadStar
        let lineWidth = isDeadStar ? 0.5 : 1

        // can be assumed to be present, this is a type problem only
        graphics.star(star.locationNext.x, star.locationNext.y, starPoints, radius, radius - 2)

        if (fillStar) {
            graphics.fill({
              color: 0xFFFFFF,
              alpha,
            })
        }

        graphics.stroke({
          width: lineWidth,
          color: 0xFFFFFF,
          alpha,
        });

        this.container.addChild(graphics)
    }

    drawCarrier (carrier: Carrier) {
        if (!carrier.locationNext || carrier.orbiting) {
            return
        }

        let graphics = new PIXI.Graphics()

        graphics.position.x = carrier.locationNext.x
        graphics.position.y = carrier.locationNext.y

        graphics.moveTo(0, 0 - 4)
        graphics.lineTo(0 + 1.5, 0 + 1)
        graphics.lineTo(0 + 3, 0 + 2)
        graphics.lineTo(0 + 1, 0 + 2)
        graphics.lineTo(0 + 0, 0 + 3)
        graphics.lineTo(0 + -1, 0 + 2)
        graphics.lineTo(0 - 3, 0 + 2)
        graphics.lineTo(0 - 1.5, 0 + 1)
        graphics.lineTo(0, 0 - 4)
        graphics.fill({
          color: 0xFFFFFF,
          alpha: 0.2
        })

        graphics.pivot.set(0, 0)
        graphics.scale.set(1)

        Helpers.rotateCarrierTowardsWaypoint(carrier, this.game!.galaxy.stars, graphics)

        this.container.addChild(graphics)
    }
}

export default OrbitalLocationLayer
