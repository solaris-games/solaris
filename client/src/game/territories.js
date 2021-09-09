import * as PIXI from 'pixi.js-legacy'
import * as Voronoi from 'voronoi'
import gameHelper from '../services/gameHelper'

class Territories {

  static zoomLevel = 100
  static maxVoronoiDistance = 200

  constructor () {
    this.container = new PIXI.Container()

    this.zoomPercent = 0
  }

  setup (game, userSettings) {
    this.game = game

    Territories.zoomLevel = userSettings.map.zoomLevels.territories
  }

  draw (userSettings) {
    this.container.removeChildren()

    if (!this.game.galaxy.stars || !this.game.galaxy.stars.length) {
      return; //No territories if we have no stars
    }

    switch(userSettings.map.territoryStyle) {
      case 'marching-square':
        this._drawTerritoriesMarchingCube(userSettings)
        break;
      case 'voronoi':
        this._drawTerritoriesVoronoi(userSettings)
        break;
    }

    this.refreshZoom(this.zoomPercent || 0)
  }

  _drawTerritoriesMarchingCube (userSettings) {
    this.container.alpha = 1

    const CELL_SIZE = 5*userSettings.map.marchingSquareGridSize
    const METABALL_RADIUS = 20*userSettings.map.marchingSquareTerritorySize
    const LINE_PROPORTION = (1/16)*userSettings.map.marchingSquareBorderWidth
    const LINE_WIDTH = CELL_SIZE*LINE_PROPORTION
    const LINE_OFFSET = LINE_PROPORTION/2

    // enum
    const ACTION_COMBINE = 1
    const ACTION_NEW = 2 
    const ACTION_SKIP = 0

    const ACTION_INDEX = 0
    const LINES_INDEX = 1
    const POLYGON_INEDX = 2
    const VERTEX_TABLE = [
      [  ACTION_SKIP, [], []  ],
      [ACTION_NEW, [{x: 0, y: 0.5+LINE_OFFSET},{x: 0.5-LINE_OFFSET, y: 1}],
        [{x: 0, y: 0.5+LINE_OFFSET},{x: 0.5-LINE_OFFSET, y: 1},{x: 0, y: 1}]
      ],
      [  ACTION_NEW, [{x: 1, y: 0.5+LINE_OFFSET},{x: 0.5+LINE_OFFSET, y: 1}],
        [{x: 1, y: 0.5+LINE_OFFSET},{x: 0.5+LINE_OFFSET, y: 1},{x: 1, y: 1}]
      ],
      [  ACTION_NEW, [{x: 1, y: 0.5+LINE_OFFSET},{x: 0, y: 0.5+LINE_OFFSET}],
        [{x: 1, y: 0.5+LINE_OFFSET},{x: 0, y: 0.5+LINE_OFFSET},{x: 0, y: 1},{x: 1, y: 1}]
      ],

      [  ACTION_NEW, [{x: 0.5+LINE_OFFSET, y: 0},{x: 1, y: 0.5-LINE_OFFSET}],
        [{x: 0.5+LINE_OFFSET, y: 0},{x: 1, y: 0.5-LINE_OFFSET},{x: 1, y: 0}]
      ],
      [  ACTION_NEW, [{x: 0.5+LINE_OFFSET, y: 0},{x: 0, y: 0.5+LINE_OFFSET},{x: 1, y: 0.5-LINE_OFFSET},{x: 0.5-LINE_OFFSET, y: 1}],
        [{x: 0.5+LINE_OFFSET, y: 0},{x: 0, y: 0.5+LINE_OFFSET},{x: 0, y: 1},{x: 0.5-LINE_OFFSET, y: 1},{x: 1, y: 0.5-LINE_OFFSET},{x: 1, y: 0}]
      ],
      [  ACTION_NEW, [{x: 0.5+LINE_OFFSET, y: 0},{x: 0.5+LINE_OFFSET, y: 1}],
        [{x: 0.5+LINE_OFFSET, y: 0},{x: 0.5+LINE_OFFSET, y: 1},{x: 1, y: 1},{x: 1, y: 0}]
      ],
      [  ACTION_NEW, [{x: 0.5+LINE_OFFSET, y: 0},{x: 0, y: 0.5+LINE_OFFSET}],
        [{x: 0.5+LINE_OFFSET, y: 0},{x: 0, y: 0.5+LINE_OFFSET},{x: 0, y: 1},{x: 1, y: 1},{x: 1, y: 0}]
      ],

      [  ACTION_NEW, [{x: 0.5-LINE_OFFSET, y: 0},{x: 0, y: 0.5-LINE_OFFSET}],
        [{x: 0.5-LINE_OFFSET, y: 0},{x: 0, y: 0.5-LINE_OFFSET},{x: 0, y: 0}]
      ],
      [  ACTION_NEW, [{x: 0.5-LINE_OFFSET, y: 0},{x: 0.5-LINE_OFFSET, y: 1}],
        [{x: 0.5-LINE_OFFSET, y: 0},{x: 0.5-LINE_OFFSET, y: 1},{x: 0, y: 1},{x: 0, y: 0}]
      ],
      [  ACTION_NEW, [{x: 0.5-LINE_OFFSET, y: 0},{x: 1, y: 0.5+LINE_OFFSET},{x: 0, y: 0.5-LINE_OFFSET},{x: 0.5+LINE_OFFSET, y: 1}],
        [{x: 0.5-LINE_OFFSET, y: 0},{x: 1, y: 0.5+LINE_OFFSET},{x: 1, y: 1},{x: 0.5+LINE_OFFSET, y: 1},{x: 0, y: 0.5-LINE_OFFSET},{x: 0, y: 0}]
      ],
      [  ACTION_NEW, [{x: 0.5-LINE_OFFSET, y: 0},{x: 1, y: 0.5+LINE_OFFSET}],
        [{x: 0.5-LINE_OFFSET, y: 0},{x: 1, y: 0.5+LINE_OFFSET},{x: 1, y: 1},{x: 0, y: 1},{x: 0, y: 0}]
      ],

      [  ACTION_NEW, [{x: 0, y: 0.5-LINE_OFFSET},{x: 1, y: 0.5-LINE_OFFSET}],
        [{x: 0, y: 0.5-LINE_OFFSET},{x: 1, y: 0.5-LINE_OFFSET},{x: 1, y: 0},{x: 0, y: 0}]
      ],
      [  ACTION_NEW, [{x: 1, y: 0.5-LINE_OFFSET},{x: 0.5-LINE_OFFSET, y: 1}],
        [{x: 1, y: 0.5-LINE_OFFSET},{x: 0.5-LINE_OFFSET, y: 1},{x: 0, y: 1},{x: 0, y: 0},{x: 1, y: 0}]
      ],
      [  ACTION_NEW, [{x: 0, y: 0.5-LINE_OFFSET},{x: 0.5+LINE_OFFSET, y: 1}],
        [{x: 0, y: 0.5-LINE_OFFSET},{x: 0.5+LINE_OFFSET, y: 1},{x: 1, y: 1},{x: 1, y: 0},{x: 0, y: 0}]
      ],
      [  ACTION_COMBINE, [],
        [{x: 0, y: 0},{x: 1, y: 0},{x: 1, y: 1},{x: 0, y: 1}]
      ],
    ]

    let minX = gameHelper.calculateMinStarX(this.game)
    let minY = gameHelper.calculateMinStarY(this.game)
    let maxX = gameHelper.calculateMaxStarX(this.game)
    let maxY = gameHelper.calculateMaxStarY(this.game)
    minX -= minX%CELL_SIZE
    minX -= Math.floor(METABALL_RADIUS*1.5/CELL_SIZE)*CELL_SIZE
    minY -= minY%CELL_SIZE
    minY -= Math.floor(METABALL_RADIUS*1.5/CELL_SIZE)*CELL_SIZE
    maxX -= maxX%CELL_SIZE
    maxX += CELL_SIZE
    maxX += Math.floor(METABALL_RADIUS*1.5/CELL_SIZE)*CELL_SIZE
    maxY -= maxY%CELL_SIZE
    maxY += CELL_SIZE
    maxY += Math.floor(METABALL_RADIUS*1.5/CELL_SIZE)*CELL_SIZE
    if(minX < 0){ minX -= CELL_SIZE }
    if(minY < 0){ minY -= CELL_SIZE }

    let gridWidth = (maxX-minX)/CELL_SIZE
    let gridHeight = (maxY-minY)/CELL_SIZE

    let samplePoints = new Array(gridWidth+1)
    
    for( let ix = 0; ix<samplePoints.length; ix++ ) {
      samplePoints[ix] = new Array(gridHeight+1)
      for( let iy = 0; iy<samplePoints[ix].length; iy++ ) {
        // find the closest star and its owner
        let pointLocation = {x: ix*CELL_SIZE+minX, y: iy*CELL_SIZE+minY}
        let closestStar = gameHelper.getClosestStar(this.game.galaxy.stars, pointLocation)
        let owner = this.game.galaxy.players.find( p => p._id === closestStar.star.ownedByPlayerId )
        // TODO get the intensity of the metaball composed of all stars of the owner
        // the owner stars shouold be cached outside this loop

        if( closestStar.distance<METABALL_RADIUS ) {
          samplePoints[ix][iy] = owner
        }
        if(false)
        {
        let pointGraphics = new PIXI.Graphics()
        pointGraphics.lineStyle(1, samplePoints[ix][iy], 1.0)
        pointGraphics.drawStar(0, 0, 5, 5, 5 - 2)
        pointGraphics.position.x = pointLocation.x
        pointGraphics.position.y = pointLocation.y
        this.container.addChild(pointGraphics)
        }
        
      }
    }
    for( let player of this.game.galaxy.players ) {
      let color = player.colour.value
      let territoryPolygons = new PIXI.Graphics()
      let territoryLines = new PIXI.Graphics()
      this.container.addChild(territoryPolygons)
      this.container.addChild(territoryLines)
      territoryLines.lineStyle(LINE_WIDTH, color, 1)
      territoryLines._lineStyle.cap = PIXI.LINE_CAP.ROUND
      territoryPolygons.alpha = 0.333

      let combining = false
      for( let ix = 0; ix<samplePoints.length-1; ix++ ) {
        for( let iy = 0; iy<samplePoints[ix].length-1; iy++ ) {
          let lookUpIndex = 0
          lookUpIndex += (player==samplePoints[ix][iy])*8
          lookUpIndex += (player==samplePoints[ix+1][iy])*4
          lookUpIndex += (player==samplePoints[ix][iy+1])*1
          lookUpIndex += (player==samplePoints[ix+1][iy+1])*2
          if( VERTEX_TABLE[lookUpIndex][ACTION_INDEX] != ACTION_SKIP ){
            let cellOrigin = {x: ix*CELL_SIZE+minX, y: iy*CELL_SIZE+minY}
            if( VERTEX_TABLE[lookUpIndex][LINES_INDEX].length>1 ) {
              //if there are vertices, draw the lines
              territoryLines.moveTo(VERTEX_TABLE[lookUpIndex][LINES_INDEX][0].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[lookUpIndex][LINES_INDEX][0].y*CELL_SIZE+cellOrigin.y)
              territoryLines.lineTo(VERTEX_TABLE[lookUpIndex][LINES_INDEX][1].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[lookUpIndex][LINES_INDEX][1].y*CELL_SIZE+cellOrigin.y)
              if( VERTEX_TABLE[lookUpIndex][LINES_INDEX].length>2 ) {
                territoryLines.moveTo(VERTEX_TABLE[lookUpIndex][LINES_INDEX][2].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[lookUpIndex][LINES_INDEX][2].y*CELL_SIZE+cellOrigin.y)
                territoryLines.lineTo(VERTEX_TABLE[lookUpIndex][LINES_INDEX][3].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[lookUpIndex][LINES_INDEX][3].y*CELL_SIZE+cellOrigin.y)
              }
            }
            
            if( VERTEX_TABLE[lookUpIndex][ACTION_INDEX] == ACTION_NEW ) {
              if( combining ) {
                //finish combining
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INEDX][1].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[15][POLYGON_INEDX][1].y*CELL_SIZE+cellOrigin.y)
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INEDX][0].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[15][POLYGON_INEDX][0].y*CELL_SIZE+cellOrigin.y)
                territoryPolygons.endFill()
                combining = false
              }
              territoryPolygons.moveTo(VERTEX_TABLE[lookUpIndex][POLYGON_INEDX][0].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[lookUpIndex][POLYGON_INEDX][0].y*CELL_SIZE+cellOrigin.y)
              territoryPolygons.beginFill(color, 1)
              let first = true
              let vertices = VERTEX_TABLE[lookUpIndex][POLYGON_INEDX]
              for( let vertex of vertices ) {
                if(first) { first = false; continue }
                territoryPolygons.lineTo(vertex.x*CELL_SIZE+cellOrigin.x, vertex.y*CELL_SIZE+cellOrigin.y)
              }
              territoryPolygons.endFill()
              
            }
            
            if( VERTEX_TABLE[lookUpIndex][ACTION_INDEX] == ACTION_COMBINE ) {
              if( !combining ) {
                //start combining
                territoryPolygons.moveTo(VERTEX_TABLE[15][POLYGON_INEDX][0].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[15][POLYGON_INEDX][0].y*CELL_SIZE+cellOrigin.y)
                territoryPolygons.beginFill(color, 1)
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INEDX][1].x*CELL_SIZE+cellOrigin.x, VERTEX_TABLE[15][POLYGON_INEDX][1].y*CELL_SIZE+cellOrigin.y)
                combining = true
              }
            }
          }
        }
      }
    }
  }

  _drawTerritoriesVoronoi (userSettings) {
    this.container.alpha = 1

    let voronoi = new Voronoi()

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
    for( let star of this.game.galaxy.stars) {
      sites.push( {
        x: star.location.x,
        y: star.location.y,
        playerID: star.ownedByPlayerId
      })
    }

    let diagram = voronoi.compute(sites, boundingBox)

    let borders = []
    for (let edge of diagram.edges) {
      if(edge.lSite && edge.rSite) {
        if(edge.lSite.playerID !== edge.rSite.playerID) {
          borders.push(edge)
        }
      }
    }

    let borderWidth = +userSettings.map.voronoiCellBorderWidth

    // Draw the cells
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
      let sanitizedPoints = points
        // .filter(point => !Number.isNaN(point.x) && !Number.isNaN(point.y)) // For some reason some of the points have NaN x and y
        .map(point => this._sanitizeVoronoiPoint(cell.site, point))

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
    // ----------

    // Draw the cell territory borders
    borderWidth = +userSettings.map.voronoiTerritoryBorderWidth

    let borderGraphics = new PIXI.Graphics()

    for(let border of borders) {
      let leftNormalAngle = gameHelper.getAngleBetweenLocations(border.va, border.vb)+Math.PI/2.0
      let leftVA = gameHelper.getPointFromLocation(border.va, leftNormalAngle, borderWidth/2.0)
      let leftVB = gameHelper.getPointFromLocation(border.vb, leftNormalAngle, borderWidth/2.0)

      let rightNormalAngle = gameHelper.getAngleBetweenLocations(border.va, border.vb)-Math.PI/2.0
      let rightVA = gameHelper.getPointFromLocation(border.va, rightNormalAngle, borderWidth/2.0)
      let rightVB = gameHelper.getPointFromLocation(border.vb, rightNormalAngle, borderWidth/2.0)

      let colour = 0x000000

      if(border.lSite.playerID) {
        colour = this.game.galaxy.players.find(p => p._id === border.lSite.playerID).colour.value
      }

      borderGraphics.lineStyle(borderWidth, colour)
      borderGraphics.moveTo(rightVA.x, rightVA.y)
      borderGraphics.lineTo(rightVB.x, rightVB.y)

      colour = 0x000000

      if(border.rSite.playerID) {
        colour = this.game.galaxy.players.find(p => p._id === border.rSite.playerID).colour.value
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

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent <= Territories.zoomLevel
    }
  }

}

export default Territories
