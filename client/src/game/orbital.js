import * as PIXI from 'pixi.js-legacy'
import Helpers from './helpers'

class OrbitalLocationLayer {

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

        graphics.lineStyle(lineWidth, 0xFFFFFF, alpha)

        if (fillStar) {
            graphics.beginFill(0xFFFFFF, alpha)
        }

        graphics.drawStar(star.locationNext.x, star.locationNext.y, starPoints, radius, radius - 2)

        if (fillStar) {
            graphics.endFill()
        }

        this.container.addChild(graphics)
    }

    drawCarrier (carrier) {
        if (!carrier.locationNext || carrier.orbiting) {
            return
        }

        let graphics = new PIXI.Graphics()
        
        graphics.beginFill(0xFFFFFF, 0.2)

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
        graphics.endFill()

        graphics.pivot.set(0, 0)
        graphics.scale.set(1)

        Helpers.rotateCarrierTowardsWaypoint(carrier, this.game.galaxy.stars, graphics)

        this.container.addChild(graphics)
    }
}

export default OrbitalLocationLayer
