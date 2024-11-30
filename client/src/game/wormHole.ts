import * as PIXI from 'pixi.js-legacy'

class WormHoleLayer {

    constructor () {
        this.container = new PIXI.Container()
    }

    setup (game) {
        this.game = game
    }

    clear () {
        this.container.removeChildren()
    }

    draw () {
        this.clear()

        const stars = this.game.galaxy.stars.filter(s => s.wormHoleToStarId)

        for (let star of stars) {
            let starPair = stars.find(s => s._id === star.wormHoleToStarId && s.wormHoleToStarId === star._id)

            if (!starPair) {
                continue
            }

            let graphics = new PIXI.Graphics()

            let alpha = 0.1
            let lineWidth = 5

            graphics.lineStyle(lineWidth, 0xFFFFFF, alpha)

            graphics.moveTo(star.location.x, star.location.y)
            graphics.lineTo(starPair.location.x, starPair.location.y)

            this.container.addChild(graphics)
        }
    }

}

export default WormHoleLayer
