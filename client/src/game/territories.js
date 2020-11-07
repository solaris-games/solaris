import * as PIXI from 'pixi.js'
import * as Voronoi from 'voronoi'

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
    let voronoi = new Voronoi()

    let minX = this._calculateMinStarX(this.game)
    let minY = this._calculateMinStarY(this.game)
    let maxX = this._calculateMaxStarX(this.game)
    let maxY = this._calculateMaxStarY(this.game)

    let boundingBox = {
      xl: minX - 100,
      xr: maxX + 100,
      yt: minY - 100,
      yb: maxY + 100
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
        let distance = this._getDistanceBetweenLocations(cell.site, point)

        if (distance > 100) {
          let angle = this._getAngleBetweenPoints(cell.site, point)
          let newPoint = this._getMaxPointFromSite(cell.site, angle, 100)

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
      this.container.addChild(territoryGraphic)
    }
  }

  _getMaxPointFromSite (site, angle, distance) {
    return {
        x: site.x + (Math.cos(angle) * distance),
        y: site.y + (Math.sin(angle) * distance)
    };
  }

  _getAngleBetweenPoints (p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  _getDistanceBetweenLocations (loc1, loc2) {
      let xs = loc2.x - loc1.x,
          ys = loc2.y - loc1.y;

      xs *= xs;
      ys *= ys;

      return Math.sqrt(xs + ys);
  }

  _calculateMinStarX (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.x - b.location.x)[0].location.x
  }

  _calculateMinStarY (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => a.location.y - b.location.y)[0].location.y
  }

  _calculateMaxStarX (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.x - a.location.x)[0].location.x
  }

  _calculateMaxStarY (game) {
    if (!game.galaxy.stars.length) { return 0 }

    return game.galaxy.stars.sort((a, b) => b.location.y - a.location.y)[0].location.y
  }
}

export default Territories
