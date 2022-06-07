import * as PIXI from 'pixi.js-legacy'
import gameHelper from '../services/gameHelper'

class PlayerNames {

  static zoomLevel = 90

  constructor () {
    this.container = new PIXI.Container()

    this.zoomPercent = 0
  }

  setup (game, userSettings) {
    this.game = game

    PlayerNames.zoomLevel = userSettings.map.zoomLevels.playerNames
  }

  draw () {
    this.container.removeChildren()
    
    for (let player of this.game.galaxy.players) {
      let empireCenter = gameHelper.getPlayerEmpireCenter(this.game, player)

      if (empireCenter == null) {
        continue
      }

      let style = new PIXI.TextStyle({
        fontFamily: `Chakra Petch,sans-serif;`,
        fill: 0xFFFFFF,
        padding: 3,
        fontSize: 50
      })

      let text_name = new PIXI.Text(player.alias, style)
      text_name.x = empireCenter.x - (text_name.width / 2)
      text_name.y = empireCenter.y - (text_name.height / 2)
      text_name.resolution = 2
      text_name.zIndex = 10

      let graphics = new PIXI.Graphics()
      graphics.beginFill(player.colour.value)
      graphics.drawRoundedRect(text_name.x - 10, text_name.y - 10, text_name.width + 20, text_name.height + 20, 10)
      graphics.endFill()
      graphics.alpha = 0.7

      this.container.addChild(graphics)
      this.container.addChild(text_name)
    }

    this.refreshZoom(this.zoomPercent || 0)
  }

  onTick( zoomPercent, zoomChanging ) {
    this.zoomPercent = zoomPercent

    if( zoomChanging ) {
      if (this.container) {
        this.container.visible = zoomPercent <= PlayerNames.zoomLevel
      }
    }
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent <= PlayerNames.zoomLevel
    }
  }

}

export default PlayerNames
