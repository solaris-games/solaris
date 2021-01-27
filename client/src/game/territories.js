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

  draw (userSettings) {
    this.clear()

    this.drawTerritories(userSettings)
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
      let empireCenter = gameHelper.getPlayerEmpireCenter(this.game, player)

      if (empireCenter == null) {
        continue
      }
      
      let style = new PIXI.TextStyle({
        fontFamily: `'Space Mono', monospace`,
        fill: 0xFFFFFF,
        padding: 3,
        fontSize: 50
      })

      let text_name = new PIXI.Text(player.alias, style)
      text_name.x = empireCenter.x - (text_name.width / 2)
      text_name.y = empireCenter.y - (text_name.height / 2)
      text_name.resolution = 10

      this.playerNamesContainer.addChild(text_name)
    }

    this.container.addChild(this.playerNamesContainer)
  }

  drawTerritories (userSettings) {
    switch(userSettings.map.territoryStyle) {
      case 'marching-square':
        this._drawTerritoriesMarchingCube(userSettings.map.marchingSquareGridSize)
        break;
      case 'voronoi':
        this._drawTerritoriesVoronoi()
        break;
    }
  }

  _drawTerritoriesMarchingCube (gridSize) {
    const CELL_SIZE = 5*gridSize
    const METABALL_RADIUS = CELL_SIZE*3
    const LINE_PROPORTION = 1/5
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
    if (this.territoryContainer) {
      this.container.removeChild(this.territoryContainer)
      this.territoryContainer = null
    }

    this.territoryContainer = new PIXI.Container()
    //this.territoryContainer.alpha = 0.3

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
    let colors = []
    for( let player of this.game.galaxy.players ) {
      colors.push(player.colour.value)
    }
    
    for( let ix = 0; ix<samplePoints.length; ix++ ) {
      samplePoints[ix] = new Array(gridHeight+1)
      for( let iy = 0; iy<samplePoints[ix].length; iy++ ) {
        // find the closest star and its owner
        let pointLocation = {x: ix*CELL_SIZE+minX, y: iy*CELL_SIZE+minY}
        let closestStar = gameHelper.getClosestStar(this.game.galaxy.stars, pointLocation)
        let owner = this.game.galaxy.players.find( p => p._id === closestStar.ownedByPlayerId )
        let color = 0xFFFFFF
        if( owner ){
          color = owner.colour.value
        }
        // TODO get the intensity of the metaball composed of all stars of the owner
        // the owner stars shouold be cached outside this loop

        let distance = gameHelper.getDistanceBetweenLocations(pointLocation, closestStar.location)
        if( distance<METABALL_RADIUS ) {
           samplePoints[ix][iy] = color
        }
        else {
           samplePoints[ix][iy] = 0xFFFFFF
        }
        if(false)
        {
        let pointGraphics = new PIXI.Graphics()
        pointGraphics.lineStyle(1, samplePoints[ix][iy], 1.0)
        pointGraphics.drawStar(0, 0, 5, 5, 5 - 2)
        pointGraphics.position.x = pointLocation.x
        pointGraphics.position.y = pointLocation.y
        this.territoryContainer.addChild(pointGraphics)
        }
        
      }
    }
    for( let color of colors ) {
      let territoryPolygons = new PIXI.Graphics()
      let territoryLines = new PIXI.Graphics()
      this.territoryContainer.addChild(territoryPolygons)
      this.territoryContainer.addChild(territoryLines)
      territoryLines.lineStyle(4, color, 1)
      territoryLines._lineStyle.cap = PIXI.LINE_CAP.ROUND
      territoryPolygons.alpha = 0.333

      let combining = false
      for( let ix = 0; ix<samplePoints.length-1; ix++ ) {
        for( let iy = 0; iy<samplePoints[ix].length-1; iy++ ) {
          let lookUpIndex = 0
          lookUpIndex += (samplePoints[ix][iy]==color)*8
          lookUpIndex += (samplePoints[ix+1][iy]==color)*4
          lookUpIndex += (samplePoints[ix][iy+1]==color)*1
          lookUpIndex += (samplePoints[ix+1][iy+1]==color)*2
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
    
    this.container.addChild(this.territoryContainer)
  }

  _drawTerritoriesVoronoi () {
    if (this.territoryContainer) {
      this.container.removeChild(this.territoryContainer)
      this.territoryContainer = null
    }

    this.territoryContainer = new PIXI.Container()
    this.territoryContainer.alpha = 0.3

    const maxDistance = 200

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

      this.territoryContainer.addChild(territoryGraphic)
    }

    this.container.addChild(this.territoryContainer)
  }

  refreshZoom (zoomPercent) {
    this.zoomPercent = zoomPercent

    if (this.territoryContainer) {
      this.territoryContainer.visible = zoomPercent <= 100
    }

    if (this.playerNamesContainer) {
      this.playerNamesContainer.visible = zoomPercent <= 90
    }
  }

}

export default Territories
