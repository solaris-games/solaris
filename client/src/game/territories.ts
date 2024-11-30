import * as PIXI from 'pixi.js-legacy'
import Voronoi from '../voronoi/Javascript-Voronoi/rhill-voronoi-core.js';
import gameHelper from '../services/gameHelper'

class Territories {

  static zoomLevel = 100
  static maxVoronoiDistance = 200

  constructor() {
    this.container = new PIXI.Container()

    this.zoomPercent = 0
  }

  setup(game, userSettings, context) {
    this.game = game
    this.context = context

    Territories.zoomLevel = userSettings.map.zoomLevels.territories
  }

  draw(userSettings) {
    this.container.removeChildren()

    if (!this.game.galaxy.stars || !this.game.galaxy.stars.length) {
      return; //No territories if we have no stars
    }

    switch (userSettings.map.territoryStyle) {
      case 'marching-square':
        this._drawTerritoriesMarchingCube(userSettings)
        break;
      case 'voronoi':
        this._drawTerritoriesVoronoi(userSettings)
        break;
    }

    this.refreshZoom(this.zoomPercent || 0)
  }

  _drawTerritoriesMarchingCube(userSettings) {
    this.container.alpha = 1

    const CELL_SIZE = 5 * userSettings.map.marchingSquareGridSize
    const METABALL_RADIUS = 20 * userSettings.map.marchingSquareTerritorySize
    const LINE_PROPORTION = (1 / 16) * userSettings.map.marchingSquareBorderWidth
    const LINE_WIDTH = CELL_SIZE * LINE_PROPORTION
    const LINE_OFFSET = LINE_PROPORTION / 2

    // enum
    const ACTION_COMBINE = 1
    const ACTION_NEW = 2
    const ACTION_SKIP = 0

    const ACTION_INDEX = 0
    const LINES_INDEX = 1
    const POLYGON_INEDX = 2
    const VERTEX_TABLE = [
      [ACTION_SKIP, [], []],
      [ACTION_NEW, [{ x: 0, y: 0.5 + LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }],
        [{ x: 0, y: 0.5 + LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }, { x: 0, y: 1 }]
      ],
      [ACTION_NEW, [{ x: 1, y: 0.5 + LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }],
        [{ x: 1, y: 0.5 + LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }, { x: 1, y: 1 }]
      ],
      [ACTION_NEW, [{ x: 1, y: 0.5 + LINE_OFFSET }, { x: 0, y: 0.5 + LINE_OFFSET }],
        [{ x: 1, y: 0.5 + LINE_OFFSET }, { x: 0, y: 0.5 + LINE_OFFSET }, { x: 0, y: 1 }, { x: 1, y: 1 }]
      ],

      [ACTION_NEW, [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 - LINE_OFFSET }],
        [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0 }]
      ],
      [ACTION_NEW, [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 + LINE_OFFSET }, { x: 1, y: 0.5 - LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }],
        [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 + LINE_OFFSET }, { x: 0, y: 1 }, { x: 0.5 - LINE_OFFSET, y: 1 }, { x: 1, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0 }]
      ],
      [ACTION_NEW, [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0.5 + LINE_OFFSET, y: 1 }],
        [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0.5 + LINE_OFFSET, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]
      ],
      [ACTION_NEW, [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 + LINE_OFFSET }],
        [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 + LINE_OFFSET }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]
      ],

      [ACTION_NEW, [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 - LINE_OFFSET }],
        [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 - LINE_OFFSET }, { x: 0, y: 0 }]
      ],
      [ACTION_NEW, [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 0.5 - LINE_OFFSET, y: 1 }],
        [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 0.5 - LINE_OFFSET, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
      ],
      [ACTION_NEW, [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 + LINE_OFFSET }, { x: 0, y: 0.5 - LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }],
        [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 + LINE_OFFSET }, { x: 1, y: 1 }, { x: 0.5 + LINE_OFFSET, y: 1 }, { x: 0, y: 0.5 - LINE_OFFSET }, { x: 0, y: 0 }]
      ],
      [ACTION_NEW, [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 + LINE_OFFSET }],
        [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 + LINE_OFFSET }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
      ],

      [ACTION_NEW, [{ x: 0, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0.5 - LINE_OFFSET }],
        [{ x: 0, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0 }, { x: 0, y: 0 }]
      ],
      [ACTION_NEW, [{ x: 1, y: 0.5 - LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }],
        [{ x: 1, y: 0.5 - LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }]
      ],
      [ACTION_NEW, [{ x: 0, y: 0.5 - LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }],
        [{ x: 0, y: 0.5 - LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 0 }]
      ],
      [ACTION_COMBINE, [],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
      ],
    ]

    let minX = gameHelper.calculateMinStarX(this.game)
    let minY = gameHelper.calculateMinStarY(this.game)
    let maxX = gameHelper.calculateMaxStarX(this.game)
    let maxY = gameHelper.calculateMaxStarY(this.game)
    minX -= minX % CELL_SIZE
    minX -= Math.floor(METABALL_RADIUS * 1.5 / CELL_SIZE) * CELL_SIZE
    minY -= minY % CELL_SIZE
    minY -= Math.floor(METABALL_RADIUS * 1.5 / CELL_SIZE) * CELL_SIZE
    maxX -= maxX % CELL_SIZE
    maxX += CELL_SIZE
    maxX += Math.floor(METABALL_RADIUS * 1.5 / CELL_SIZE) * CELL_SIZE
    maxY -= maxY % CELL_SIZE
    maxY += CELL_SIZE
    maxY += Math.floor(METABALL_RADIUS * 1.5 / CELL_SIZE) * CELL_SIZE
    if (minX < 0) { minX -= CELL_SIZE }
    if (minY < 0) { minY -= CELL_SIZE }

    let gridWidth = (maxX - minX) / CELL_SIZE
    let gridHeight = (maxY - minY) / CELL_SIZE

    let samplePoints = Array.from(Array(gridWidth + 1), () => new Array(gridHeight + 1));

    const gridToCoord = (ix, iy) => {
      return {
        x: ix * CELL_SIZE + minX,
        y: iy * CELL_SIZE + minY
      }
    }

    let startIX, endIX, startIY, endIY, gridLocation, distance, owner;
    let stars = this.game.galaxy.stars
    for (let star of stars) {
      // This loop goes through all stars, and generates the gridPoints that are within the METABALL_RADIUS
      // Those points get the value of this star, or keep their previous value (from another star) if that one was closer
      startIX = Math.ceil((star.location.x - METABALL_RADIUS - minX) / CELL_SIZE); //The minimum ix can be and still be in the METABALL_RADIUS
      endIX = Math.floor((star.location.x + METABALL_RADIUS - minX) / CELL_SIZE); //The maximum ix can be and still be in the METABALL_RADIUS
      for (let ix = startIX; ix <= endIX; ix++) {
        startIY = Math.ceil((star.location.y - Math.sqrt((METABALL_RADIUS)**2 - (star.location.x - (ix * CELL_SIZE + minX))**2) - minY) / CELL_SIZE); // The minimum iy can be and still be in the METABALL_RADIUS
        endIY = Math.floor((star.location.y + Math.sqrt((METABALL_RADIUS)**2 - (star.location.x - (ix * CELL_SIZE + minX))**2) - minY) / CELL_SIZE); // The maximum iy can be and still be in the METABALL_RADIUS
        for (let iy = startIY; iy <= endIY; iy++) {
          gridLocation = gridToCoord(ix, iy); // Get the location in x, y of the gridPoint we are currently looping through
          distance = gameHelper.getDistanceBetweenLocations(gridLocation, star.location); // Get the distance between the gridPoint and the star
          if (samplePoints[ix][iy] && samplePoints[ix][iy].distance < distance) { // If the gridpoint has a value AND the distance currently logged (from a previous star) is smaller than the current one THEN don't log anything
            // Do nothing, because the grid already has a value from a star that is closer
          } else {
            // Now either the grid doesn't have a value here yet or the star calculated here is closer than the one currently logged in
            owner = this.game.galaxy.players.find(p => p._id === star.ownedByPlayerId)
            samplePoints[ix][iy] = { distance, owner }; // Make this gridPoint the value of the distance from the star so we can compare it with other stars AND make it have the value for the owner (the player)
          }
        }
      }
    }
    // Loops through all samplePoints, to make the value of the point the owner, instead of {distance, owner} because that is what the next function takes as input.
    for (let ix = 0; ix < samplePoints.length - 1; ix++) {
      for (let iy = 0; iy < samplePoints[ix].length - 1; iy++) {
        if (samplePoints[ix][iy]) {
          samplePoints[ix][iy] = samplePoints[ix][iy].owner;
        }
      }
    }

    for (let player of this.game.galaxy.players) {
      let color = this.context.getPlayerColour(player._id)
      let territoryPolygons = new PIXI.Graphics()
      let territoryLines = new PIXI.Graphics()
      this.container.addChild(territoryPolygons)
      this.container.addChild(territoryLines)
      territoryLines.lineStyle(LINE_WIDTH, color, 1)
      territoryLines._lineStyle.cap = PIXI.LINE_CAP.ROUND
      territoryPolygons.alpha = 0.333

      let combining = false
      for (let ix = 0; ix < samplePoints.length - 1; ix++) {
        for (let iy = 0; iy < samplePoints[ix].length - 1; iy++) {
          let lookUpIndex = 0
          lookUpIndex += (player == samplePoints[ix][iy]) * 8
          lookUpIndex += (player == samplePoints[ix + 1][iy]) * 4
          lookUpIndex += (player == samplePoints[ix][iy + 1]) * 1
          lookUpIndex += (player == samplePoints[ix + 1][iy + 1]) * 2
          if (VERTEX_TABLE[lookUpIndex][ACTION_INDEX] != ACTION_SKIP) {
            let cellOrigin = { x: ix * CELL_SIZE + minX, y: iy * CELL_SIZE + minY }
            if (VERTEX_TABLE[lookUpIndex][LINES_INDEX].length > 1) {
              //if there are vertices, draw the lines
              territoryLines.moveTo(VERTEX_TABLE[lookUpIndex][LINES_INDEX][0].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[lookUpIndex][LINES_INDEX][0].y * CELL_SIZE + cellOrigin.y)
              territoryLines.lineTo(VERTEX_TABLE[lookUpIndex][LINES_INDEX][1].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[lookUpIndex][LINES_INDEX][1].y * CELL_SIZE + cellOrigin.y)
              if (VERTEX_TABLE[lookUpIndex][LINES_INDEX].length > 2) {
                territoryLines.moveTo(VERTEX_TABLE[lookUpIndex][LINES_INDEX][2].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[lookUpIndex][LINES_INDEX][2].y * CELL_SIZE + cellOrigin.y)
                territoryLines.lineTo(VERTEX_TABLE[lookUpIndex][LINES_INDEX][3].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[lookUpIndex][LINES_INDEX][3].y * CELL_SIZE + cellOrigin.y)
              }
            }

            if (VERTEX_TABLE[lookUpIndex][ACTION_INDEX] == ACTION_NEW) {
              if (combining) {
                //finish combining
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INEDX][1].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[15][POLYGON_INEDX][1].y * CELL_SIZE + cellOrigin.y)
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INEDX][0].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[15][POLYGON_INEDX][0].y * CELL_SIZE + cellOrigin.y)
                territoryPolygons.endFill()
                combining = false
              }
              territoryPolygons.moveTo(VERTEX_TABLE[lookUpIndex][POLYGON_INEDX][0].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[lookUpIndex][POLYGON_INEDX][0].y * CELL_SIZE + cellOrigin.y)
              territoryPolygons.beginFill(color, 1)
              let first = true
              let vertices = VERTEX_TABLE[lookUpIndex][POLYGON_INEDX]
              for (let vertex of vertices) {
                if (first) { first = false; continue }
                territoryPolygons.lineTo(vertex.x * CELL_SIZE + cellOrigin.x, vertex.y * CELL_SIZE + cellOrigin.y)
              }
              territoryPolygons.endFill()

            }

            if (VERTEX_TABLE[lookUpIndex][ACTION_INDEX] == ACTION_COMBINE) {
              if (!combining) {
                //start combining
                territoryPolygons.moveTo(VERTEX_TABLE[15][POLYGON_INEDX][0].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[15][POLYGON_INEDX][0].y * CELL_SIZE + cellOrigin.y)
                territoryPolygons.beginFill(color, 1)
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INEDX][1].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[15][POLYGON_INEDX][1].y * CELL_SIZE + cellOrigin.y)
                combining = true
              }
            }
          }
        }
      }
    }
  }

  _drawTerritoriesVoronoi(userSettings) {
    this.container.alpha = 1

    let voronoi = new Voronoi.Voronoi()

    let minX = gameHelper.calculateMinStarX(this.game)
    let minY = gameHelper.calculateMinStarY(this.game)
    let maxX = gameHelper.calculateMaxStarX(this.game)
    let maxY = gameHelper.calculateMaxStarY(this.game)

    let boundingBox = {
      xl: minX - Territories.maxVoronoiDistance,
      xr: maxX + Territories.maxVoronoiDistance,
      yt: minY - Territories.maxVoronoiDistance,
      yb: maxY + Territories.maxVoronoiDistance
    }

    let sites = []
    for (let star of this.game.galaxy.stars) {
      sites.push({
        x: star.location.x,
        y: star.location.y,
        playerID: star.ownedByPlayerId
      })
    }

    let diagram = voronoi.compute(sites, boundingBox)

    let borders = []
    for (let edge of diagram.edges) {
      if (edge.lSite && edge.rSite) {
        if (edge.lSite.playerID !== edge.rSite.playerID) {
          borders.push(edge)
        }
      }
    }

    let borderWidth = +userSettings.map.voronoiCellBorderWidth

    let allPoints = new Map()

    const getPoint = (point) => {
      return allPoints.get(point).reduce((pointA, pointB) => {
        return { x: pointA.x + pointB.x / allPoints.get(point).length, y: pointA.y + pointB.y / allPoints.get(point).length }
      }, { x: 0, y: 0 })
    }

    const endpointCheck = (cell, endpoint) => {
      if (allPoints.has(endpoint)) {
        let newPoint = this._sanitizeVoronoiPoint(cell.site, endpoint)
        let ListPoints = allPoints.get(endpoint)
        if (ListPoints.every(point => point.x !== newPoint.x && point.y !== newPoint.y)) ListPoints.push(newPoint)
      } else {
        allPoints.set(endpoint, [this._sanitizeVoronoiPoint(cell.site, endpoint)])
      }
    }

    for (let cell of diagram.cells) {
      for (let halfedge of cell.halfedges) {
        endpointCheck(cell, halfedge.getStartpoint())
        endpointCheck(cell, halfedge.getEndpoint())
      }
    }

    // Draw the cells
    for (let cell of diagram.cells) {
      let star = this.game.galaxy.stars.find(s => s.location.x === cell.site.x && s.location.y === cell.site.y);

      let colour = 0x000000

      if (star.ownedByPlayerId) {
        colour = this.context.getPlayerColour(star.ownedByPlayerId)
      }

      let points = []

      for (let halfedge of cell.halfedges) {
        points.push(halfedge.getStartpoint())
        points.push(halfedge.getEndpoint())
      }

      // Do not draw points that are more than X distance away from the star.
      // let sanitizedPoints = points
      let sanitizedPoints = points.map(getPoint)

      if (sanitizedPoints.length) {
        // Draw the graphic
        let territoryGraphic = new PIXI.Graphics()
        territoryGraphic.lineStyle(borderWidth, colour, 1)
        territoryGraphic.beginFill(colour, 0.3)
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
    // ----------

    // Draw the cell territory borders
    borderWidth = +userSettings.map.voronoiTerritoryBorderWidth

    let borderGraphics = new PIXI.Graphics()

    for (let border of borders) {
      let borderVA = getPoint(border.va)
      let borderVB = getPoint(border.vb)
      let leftNormalAngle = gameHelper.getAngleBetweenLocations(borderVA, borderVB) + Math.PI / 2.0
      let leftVA = gameHelper.getPointFromLocation(borderVA, leftNormalAngle, borderWidth / 2.0)
      let leftVB = gameHelper.getPointFromLocation(borderVB, leftNormalAngle, borderWidth / 2.0)

      let rightNormalAngle = gameHelper.getAngleBetweenLocations(borderVA, borderVB) - Math.PI / 2.0
      let rightVA = gameHelper.getPointFromLocation(borderVA, rightNormalAngle, borderWidth / 2.0)
      let rightVB = gameHelper.getPointFromLocation(borderVB, rightNormalAngle, borderWidth / 2.0)

      let colour = 0x000000

      if (border.lSite.playerID) {
        colour = this.context.getPlayerColour(border.lSite.playerID);
      }

      borderGraphics.lineStyle(borderWidth, colour)
      borderGraphics.moveTo(rightVA.x, rightVA.y)
      borderGraphics.lineTo(rightVB.x, rightVB.y)

      colour = 0x000000

      if (border.rSite.playerID) {
        colour = this.context.getPlayerColour(border.rSite.playerID)
      }

      borderGraphics.lineStyle(borderWidth, colour)
      borderGraphics.moveTo(leftVA.x, leftVA.y)
      borderGraphics.lineTo(leftVB.x, leftVB.y)
    }

    this.container.addChild(borderGraphics)
  }

  _sanitizeVoronoiPoint(site, point) {
    let distance = gameHelper.getDistanceBetweenLocations(site, point)
    let angle = gameHelper.getAngleBetweenLocations(site, point)

    if (distance > Territories.maxVoronoiDistance) {
      return gameHelper.getPointFromLocation(site, angle, Territories.maxVoronoiDistance)
    }

    return point;
  }

  refreshZoom(zoomPercent) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent <= Territories.zoomLevel
    }
  }

}

export default Territories
