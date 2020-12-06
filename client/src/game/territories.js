import * as PIXI from 'pixi.js-legacy'
import * as Voronoi from 'voronoi'
import gameHelper from '../services/gameHelper'

class Territories {
  constructor () {
    this.container = new PIXI.Container()
    this.zoomPercent = 0
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
    this.drawPlayerNames()

    this.refreshZoom(this.zoomPercent || 0)
  }

  drawPlayerNames () {
    if (this.playerNamesContainer) {
      this.container.removeChild(this.playerNamesContainer)
      this.playerNamesContainer = null
    }

    this.playerNamesContainer = new PIXI.Container()
    this.playerNamesContainer.alpha = 0.8

    for (let player of this.game.galaxy.players) {
      // Get all of the player's stars.
      let playerStars = gameHelper.getStarsOwnedByPlayer(player, this.game.galaxy.stars)

      if (!playerStars.length) {
        continue
      }

      // Work out the center point of all stars
      let centerX = playerStars.reduce((sum, s) => sum + s.location.x, 0) / playerStars.length
      let centerY = playerStars.reduce((sum, s) => sum + s.location.y, 0) / playerStars.length

      let style = new PIXI.TextStyle({
        fontFamily: `'Space Mono', monospace`,
        fill: 0xFFFFFF,
        padding: 3,
        fontSize: 50
      })

      let text_name = new PIXI.Text(player.alias, style)
      text_name.x = centerX - (text_name.width / 2)
      text_name.y = centerY - (text_name.height / 2)
      text_name.resolution = 10

      this.playerNamesContainer.addChild(text_name)
    }

    this.container.addChild(this.playerNamesContainer)
  }

  drawTerritories () {
    if (this.voronoiContainer) {
      this.container.removeChild(this.voronoiContainer)
      this.voronoiContainer = null
    }

    this.voronoiContainer = new PIXI.Container()
    this.voronoiContainer.alpha = 0.3

    const maxDistance = 100

    let voronoi = new Voronoi()

    let minX = gameHelper.calculateMinStarX(this.game)
    let minY = gameHelper.calculateMinStarY(this.game)
    let maxX = gameHelper.calculateMaxStarX(this.game)
    let maxY = gameHelper.calculateMaxStarY(this.game)

    let boundingBox = {
      xl: minX - maxDistance,
      xr: maxX + maxDistance,
      yt: minY - maxDistance,
      yb: maxY + maxDistance
    }

    let sites = this.game.galaxy.stars.map(s => s.location)

    let diagram = voronoi.compute(sites, boundingBox)

    for (let cell of diagram.cells) {
      let star = this.game.galaxy.stars.find(s => s.location.x === cell.site.x && s.location.y === cell.site.y);

      let colour = 0x000000

      if (star.ownedByPlayerId) {
        colour = this.game.galaxy.players.find(p => p._id === star.ownedByPlayerId).colour.value
      }

      let points = []
      
      for (let halfedge of cell.halfedges) {
        points.push(halfedge.getStartpoint())
        points.push(halfedge.getEndpoint())
      }

      // Do not draw points that are more than X distance away from the star.
      let sanitizedPoints = []

      for (let point of points) {
        let distance = gameHelper.getDistanceBetweenLocations(cell.site, point)

        if (distance > maxDistance) {
          let angle = gameHelper.getAngleBetweenLocations(cell.site, point)
          let newPoint = gameHelper.getPointFromLocation(cell.site, angle, maxDistance)

          sanitizedPoints.push(newPoint)
        }
        else {
          sanitizedPoints.push(point)
        }
      }
      
      // Draw the graphic
      let territoryGraphic = new PIXI.Graphics()
      territoryGraphic.lineStyle(1, 0xFFFFFF, 1)
      territoryGraphic.beginFill(colour, 1)
      territoryGraphic.moveTo(sanitizedPoints[0].x, sanitizedPoints[0].y)

      for (let point of sanitizedPoints) {
        territoryGraphic.lineTo(point.x, point.y)
      }

      // Draw another line back to the origin.
      territoryGraphic.lineTo(sanitizedPoints[0].x, sanitizedPoints[0].y)

      territoryGraphic.endFill()

      this.voronoiContainer.addChild(territoryGraphic)
    }

    this.container.addChild(this.voronoiContainer)
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent

    if (this.voronoiContainer) {
      this.voronoiContainer.visible = zoomPercent < 100
    }

    if (this.playerNamesContainer) {
      this.playerNamesContainer.visible = zoomPercent < 75
    }
  }

}

export default Territories
