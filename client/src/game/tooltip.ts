import * as PIXI from 'pixi.js'
import GameHelper from '../services/gameHelper'
import type { Game } from '../types/game';
import type { DrawingContext } from './container';
import {getCountdownTimeStringByTicks} from "@/util/time";

export default class {

  container: PIXI.Container;
  game: Game | undefined;
  context: DrawingContext | undefined;
  intervalDraw: number | null = null;

  constructor() {
    this.container = new PIXI.Container()
    this.container.eventMode = 'passive'
  }

  setup(game, context) {
    this.game = game
    this.context = context
  }

  destroy() {
    this.game = undefined;
    this.clear();
  }

  clear() {
    if (this.intervalDraw) {
      clearInterval(this.intervalDraw)
      this.intervalDraw = null
    }

    this.container.removeChildren()
  }

  _drawTooltip(tooltipData) {
    this.container.removeChildren()

    if (!this.game) {
      return;
    }

    const player = GameHelper.getPlayerById(this.game!, tooltipData.playerId)!

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

      const prev = internalContainer.children[i - 1] as PIXI.Text;

      if (prev) {
        text.y = prev.y + prev.height
      } else {
        text.y = 0
      }

      internalContainer.addChild(text)
    }

    const graphics = new PIXI.Graphics()
    graphics.roundRect(0, 0, internalContainer.width + (paddingX * 2), internalContainer.height + (paddingY * 2), 1)

    graphics.fill({
      color: 0x000000,
    });

    graphics.stroke({
      width: 1,
      color: this.context!.getPlayerColour(player._id),
    });

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

  drawTooltipCarrier(carrier) {
    this.clear()

    // Note: We have to do this in order to account
    // for carrier ETAs in real time.
    const redraw = () => {
      if (!this.game) {
        return;
      }

      const isOwnedByUserPlayer = GameHelper.isOwnedByUserPlayer(this.game, carrier)

      const detail = [
        `⏱️ ` + getCountdownTimeStringByTicks(this.game, carrier.ticksEta)
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

  drawTooltipStar(star) {
    this.clear()

    const carriers = GameHelper.getCarriersOrbitingStar(this.game!, star);

    if (!carriers.length) {
      return
    }

    let detail: string[] = []

    if (star.ships != null && star.ships > 0) {
      detail.push(
        `⭐ ${star.ships == null ? '???' : star.ships} garrisoned\n`
      )
    }

    const carrierStrings = carriers.map(carrier => {
      const isOwnedByUserPlayer = GameHelper.isOwnedByUserPlayer(this.game!, carrier)

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
