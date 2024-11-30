import * as PIXI from 'pixi.js-legacy'
import GameHelper from '../services/gameHelper'

export default class {
    constructor() {
        this.container = new PIXI.Container()
        this.container.eventMode = 'passive'
        this.container.cursor = null
    }

    setup (game, context) {
        this.game = game
        this.context = context
    }

    clear () {
        if (this.intervalDraw) {
            clearInterval(this.intervalDraw)
            this.intervalDraw = null
        }

        this.container.removeChildren()
        this.tooltip = null
    }

    _drawTooltip (tooltipData) {
        this.container.removeChildren()
        this.tooltip = null

        const player = GameHelper.getPlayerById(this.game, tooltipData.playerId)

        const paddingX = 2
        const paddingY = 2

        const internalContainer = new PIXI.Container()
        internalContainer.x = paddingX
        internalContainer.y = paddingY

        let textStyle = new PIXI.TextStyle({
            fontFamily: `Chakra Petch,sans-serif;`,
            fill: 0xFFFFFF,
            fontSize: 6,
            fontWeight: 'bold'
        })

        for (let i = 0; i < tooltipData.detail.length; i++) {
            const text = new PIXI.Text(tooltipData.detail[i], textStyle)
            text.resolution = 12

            const prev = internalContainer.children[i - 1]

            if (prev) {
                text.y = prev.y + prev.height
            } else {
                text.y = 0
            }

            internalContainer.addChild(text)
        }

        let graphics = new PIXI.Graphics()
        graphics.lineStyle(1, this.context.getPlayerColour(player._id))
        graphics.beginFill(0x000000)
        graphics.drawRoundedRect(0, 0, internalContainer.width + (paddingX*2), internalContainer.height + (paddingY*2), 1)
        graphics.endFill()

        this.container.addChild(graphics)
        this.container.addChild(internalContainer)

        if (tooltipData.offset.relative) {
            this.container.x = tooltipData.location.x + tooltipData.offset.x
            this.container.y = tooltipData.location.y - (this.container.height / 2) + tooltipData.offset.y
        } else {
            this.container.x = tooltipData.location.x + tooltipData.offset.x
            this.container.y = tooltipData.location.y + tooltipData.offset.y
        }
    }

    drawTooltipCarrier (carrier) {
        this.clear()

        // Note: We have to do this in order to account
        // for carrier ETAs in real time.
        const redraw = () => {
            const isOwnedByUserPlayer = GameHelper.isOwnedByUserPlayer(this.game, carrier)

            const detail = [
                `⏱️ ` + GameHelper.getCountdownTimeStringByTicks(this.game, carrier.ticksEta)
            ]

            if (isOwnedByUserPlayer) {
                detail.push(`${carrier.waypointsLooped ? '🔄' : '📍'} ${carrier.waypoints.length} waypoint${carrier.waypoints.length !== 1 ? 's' : ''}`)
            }

            this._drawTooltip({
                playerId: carrier.ownedByPlayerId,
                location: carrier.location,
                detail,
                offset: {
                    relative: true,
                    x: 6,
                    y: 2
                }
            })
        }

        this.intervalDraw = setInterval(redraw, 250)
        redraw()
    }

    drawTooltipStar (star) {
        this.clear()

        const carriers = GameHelper.getCarriersOrbitingStar(this.game, star)

        if (!carriers.length) {
            return
        }

        let detail = []

        if (star.ships != null && star.ships > 0) {
            detail.push(
                `⭐ ${star.ships == null ? '???' : star.ships} garrisoned\n`
            )
        }

        const carrierStrings = carriers.map(carrier => {
            const isOwnedByUserPlayer = GameHelper.isOwnedByUserPlayer(this.game, carrier)

            let result = `\n${carrier.name}` +
                `\n 🚀 ${carrier.ships || '???'} ship${carrier.ships !== 1 ? 's' : ''}`

            if (isOwnedByUserPlayer) {
                result += `\n ${carrier.waypointsLooped ? '🔄' : '📍'} ${carrier.waypoints.length} waypoint${carrier.waypoints.length !== 1 ? 's' : ''}`
            }

            if (carrier.specialist && carrier.specialist.name) {
                result += `\n 🧑‍🚀 ${carrier.specialist.name}`
            }

            return result
        })

        carrierStrings[0] = carrierStrings[0].trim()

        detail = detail.concat(carrierStrings)

        this._drawTooltip({
            playerId: star.ownedByPlayerId,
            location: star.location,
            detail,
            offset: {
                relative: false,
                x: 0,
                y: 6
            }
        })
    }
}
