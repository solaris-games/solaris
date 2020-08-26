import * as PIXI from 'pixi.js'

class Territories {
  constructor () {
    this.container = new PIXI.Container()
    this.container.alpha = 0.3
  }

  setup (game) {
    this.game = game

    this.clear()
  }

  clear () {
    this.container.removeChildren()
  }

  draw () {
    this.clear()

    this.drawTerritories()
  }

  drawTerritories () {
    for (let player of this.game.galaxy.players) {
      let playerStars = this.game.galaxy.stars.filter(s => s.ownedByPlayerId && s.ownedByPlayerId === player._id)

      let territoryGraphic = new PIXI.Graphics()
      territoryGraphic.beginFill(player.colour.value)

      for (let star of playerStars) {
        territoryGraphic.drawCircle(star.location.x, star.location.y, this.game.constants.distances.lightYear)
      }

      territoryGraphic.endFill()
      territoryGraphic.cacheAsBitmap = true

      this.container.addChild(territoryGraphic)
    }
  }

}

export default Territories
