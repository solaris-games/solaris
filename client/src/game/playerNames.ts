import { Container, Text, TextStyle, Graphics } from 'pixi.js'
import gameHelper from '../services/gameHelper'
import type {Game} from "../types/game";
import type {DrawingContext} from "./container";
import type {UserGameSettings} from "@solaris-common";

class PlayerNames {

  static zoomLevel = 90

  container: Container;
  zoomPercent = 0;

  game: Game | undefined;
  context: DrawingContext | undefined;

  constructor () {
    this.container = new Container()
  }

  setup (game: Game, userSettings: UserGameSettings, context: DrawingContext) {
    this.game = game

    PlayerNames.zoomLevel = userSettings.map.zoomLevels.playerNames
    this.context = context
  }

  draw () {
    this.container.removeChildren()

    for (let player of this.game!.galaxy.players) {
      const empireCenter = gameHelper.getPlayerTerritoryCenter(this.game!, player)

      if (empireCenter == null) {
        continue
      }

      const style = new TextStyle({
        fontFamily: `Chakra Petch,sans-serif;`,
        fill: 0xFFFFFF,
        padding: 3,
        fontSize: 50
      })

      const textContainer = new Container()

      const text_name = new Text({
        text: player.alias,
        style
      });
      text_name.resolution = 2
      text_name.zIndex = 10

      let graphics = new Graphics()
      graphics.roundRect(-10, -10, text_name.width + 20, text_name.height + 20, 10)
      graphics.fill({
        color: this.context!.getPlayerColour(player._id),
        alpha: 0.7
      });

      textContainer.x = empireCenter.x - (text_name.width / 2)
      textContainer.y = empireCenter.y - (text_name.height / 2)

      textContainer.addChild(graphics)
      textContainer.addChild(text_name)

      this.container.addChild(textContainer)
    }

    this.separate()

    this.refreshZoom(this.zoomPercent || 0)
  }

  separate () {
    const rects = this.container.children as Container[];

    const hasOverlap = (rectA, rectB) => {
      // a left >= b right or b left >= a right
      if (rectA.x >= rectB.x + rectB.width || rectB.x >= rectA.x + rectA.width) {
        return false
      }

      // a top >= b bottom or b top >= a bottom
      if (rectA.y >= rectB.y + rectB.height || rectB.y >= rectA.y + rectA.height) {
        return false
      }

      return true
    }

    const hasOverlaps = () => {
      for (let i = 0; i < rects.length - 1; i++) {
        for (let ii = 0; ii < rects.length - 1; ii++) {
          if (i === ii) {
            continue
          }

          if (hasOverlap(rects[i], rects[ii])) {
            return true
          }
        }
      }

      return false
    }

    const translate = (rect, index) => {
      const overlapVector = {
        x: 0,
        y: 0
      }

      for (let i = 0; i < rects.length - 1; i++) {
        if (i === index) {
          continue
        }

        const otherRect = rects[i]

        if (hasOverlap(rect, otherRect)) {
          const rectMidVec = {
            x: (rect.x + rect.x + rect.width) / 2,
            y: (rect.y + rect.y + rect.height) / 2
          }

          const otherMidVec = {
            x: (otherRect.x + otherRect.x + otherRect.width) / 2,
            y: (otherRect.y + otherRect.y + otherRect.height) / 2
          }

          overlapVector.x += rectMidVec.x - otherMidVec.x
          overlapVector.y += rectMidVec.y - otherMidVec.y
        }
      }

      return overlapVector
    }

    const normalize = (vector) => {
      const mag = Math.sqrt(vector.x ** 2 + vector.y ** 2)

      if (mag === 0) {
        return
      }

      vector.x = vector.x / mag
      vector.y = vector.y / mag
    }

    while (hasOverlaps()) {
      for (let i = 0; i < rects.length - 1; i++) {
        const rect = rects[i]

        const newVector = translate(rect, i)

        normalize(newVector)

        rect.x += newVector.x
        rect.y += newVector.y
      }
    }
  }

  onTick( zoomPercent, zoomChanging ) {
    this.zoomPercent = zoomPercent

    if( zoomChanging ) {
      if (this.container) {
        this.container.visible = zoomPercent <= PlayerNames.zoomLevel
      }
    }
  }

  refreshZoom (zoomPercent: number) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent <= PlayerNames.zoomLevel
    }
  }

}

export default PlayerNames
