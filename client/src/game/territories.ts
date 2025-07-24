import { Container, Graphics } from 'pixi.js'
import Voronoi from '../voronoi/Javascript-Voronoi/rhill-voronoi-core.js';
import gameHelper from '../services/gameHelper'
import type {Game, Player} from '../types/game';
import type { DrawingContext } from './container';
import type {UserGameSettings, Location} from "@solaris-common";

type SamplePoint = {
  distance: number;
  owner: Player | undefined;
}

type Site = {
  x: number;
  y: number;
  playerID: string | null;
}

enum VertexAction {
  ACTION_COMBINE = 1,
  ACTION_NEW = 2,
  ACTION_SKIP = 0,
}

const ACTION_INDEX = 0;
const   LINES_INDEX = 1;
const   POLYGON_INDEX = 2;

type Position = {
  x: number;
  y: number;
}

type VertexSpec = [VertexAction, Position[], Position[]];

const MAX_VORONOI_DISTANCE = 200

export class Territories {
  container: Container;
  game: Game;
  zoomPercent: number;
  context: DrawingContext;
  userSettings: UserGameSettings;

  constructor(context: DrawingContext, game: Game, userSettings: UserGameSettings) {
    this.container = new Container();
    this.game = game;
    this.context = context;
    this.zoomPercent = 0;
    this.userSettings = userSettings;
  }

  update(game: Game, userSettings: UserGameSettings) {
    this.game = game;
    this.userSettings = userSettings;
  }

  draw() {
    this.container.removeChildren()

    if (!this.game.galaxy.stars?.length) {
      return;
    }

    switch (this.userSettings.map.territoryStyle) {
      case 'marching-square':
        this._drawTerritoriesMarchingCube(this.userSettings)
        break;
      case 'voronoi':
        this._drawTerritoriesVoronoi(this.userSettings)
        break;
    }

    this.refreshZoom(this.zoomPercent || 0)
  }

  _drawTerritoriesMarchingCube(userSettings: UserGameSettings) {
    this.container.alpha = 1

    const CELL_SIZE = 5 * userSettings.map.marchingSquareGridSize
    const METABALL_RADIUS = 20 * userSettings.map.marchingSquareTerritorySize
    const LINE_PROPORTION = (1 / 16) * userSettings.map.marchingSquareBorderWidth
    const LINE_WIDTH = CELL_SIZE * LINE_PROPORTION
    const LINE_OFFSET = LINE_PROPORTION / 2

    // enum

    const VERTEX_TABLE: VertexSpec[] = [
      [VertexAction.ACTION_SKIP, [], []],
      [VertexAction.ACTION_NEW, [{ x: 0, y: 0.5 + LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }],
        [{ x: 0, y: 0.5 + LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }, { x: 0, y: 1 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 1, y: 0.5 + LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }],
        [{ x: 1, y: 0.5 + LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }, { x: 1, y: 1 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 1, y: 0.5 + LINE_OFFSET }, { x: 0, y: 0.5 + LINE_OFFSET }],
        [{ x: 1, y: 0.5 + LINE_OFFSET }, { x: 0, y: 0.5 + LINE_OFFSET }, { x: 0, y: 1 }, { x: 1, y: 1 }]
      ],

      [VertexAction.ACTION_NEW, [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 - LINE_OFFSET }],
        [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 + LINE_OFFSET }, { x: 1, y: 0.5 - LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }],
        [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 + LINE_OFFSET }, { x: 0, y: 1 }, { x: 0.5 - LINE_OFFSET, y: 1 }, { x: 1, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0.5 + LINE_OFFSET, y: 1 }],
        [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0.5 + LINE_OFFSET, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 + LINE_OFFSET }],
        [{ x: 0.5 + LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 + LINE_OFFSET }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }]
      ],

      [VertexAction.ACTION_NEW, [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 - LINE_OFFSET }],
        [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 0, y: 0.5 - LINE_OFFSET }, { x: 0, y: 0 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 0.5 - LINE_OFFSET, y: 1 }],
        [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 0.5 - LINE_OFFSET, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 + LINE_OFFSET }, { x: 0, y: 0.5 - LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }],
        [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 + LINE_OFFSET }, { x: 1, y: 1 }, { x: 0.5 + LINE_OFFSET, y: 1 }, { x: 0, y: 0.5 - LINE_OFFSET }, { x: 0, y: 0 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 + LINE_OFFSET }],
        [{ x: 0.5 - LINE_OFFSET, y: 0 }, { x: 1, y: 0.5 + LINE_OFFSET }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }]
      ],

      [VertexAction.ACTION_NEW, [{ x: 0, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0.5 - LINE_OFFSET }],
        [{ x: 0, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0.5 - LINE_OFFSET }, { x: 1, y: 0 }, { x: 0, y: 0 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 1, y: 0.5 - LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }],
        [{ x: 1, y: 0.5 - LINE_OFFSET }, { x: 0.5 - LINE_OFFSET, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }]
      ],
      [VertexAction.ACTION_NEW, [{ x: 0, y: 0.5 - LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }],
        [{ x: 0, y: 0.5 - LINE_OFFSET }, { x: 0.5 + LINE_OFFSET, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 0 }]
      ],
      [VertexAction.ACTION_COMBINE, [],
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }]
      ],
    ]

    let minX = gameHelper.calculateMinStarX(this.game!)
    let minY = gameHelper.calculateMinStarY(this.game!)
    let maxX = gameHelper.calculateMaxStarX(this.game!)
    let maxY = gameHelper.calculateMaxStarY(this.game!)
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

    let samplePoints: SamplePoint[][] = Array.from(Array(gridWidth + 1), () => new Array(gridHeight + 1));

    const gridToCoord = (ix, iy) => {
      return {
        x: ix * CELL_SIZE + minX,
        y: iy * CELL_SIZE + minY
      }
    }

    let startIX, endIX, startIY, endIY, gridLocation, distance;
    let stars = this.game!.galaxy.stars
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

            const owner = this.game!.galaxy.players.find(p => p._id === star.ownedByPlayerId)

            samplePoints[ix][iy] = { distance, owner }; // Make this gridPoint the value of the distance from the star so we can compare it with other stars AND make it have the value for the owner (the player)
          }
        }
      }
    }

    const playerSamplePoints: (Player | undefined)[][] = new Array(samplePoints.length);

    for (let ix = 0; ix < samplePoints.length - 1; ix++) {
      playerSamplePoints[ix] = new Array(samplePoints[ix].length);

      for (let iy = 0; iy < samplePoints[ix].length - 1; iy++) {
        if (samplePoints[ix][iy]) {
          playerSamplePoints[ix][iy] = samplePoints[ix][iy].owner;
        }
      }
    }

    for (let player of this.game!.galaxy.players) {
      let color = this.context!.getPlayerColour(player._id)
      let territoryPolygons = new Graphics()
      let territoryLines = new Graphics()
      this.container.addChild(territoryPolygons)
      this.container.addChild(territoryLines)
      territoryPolygons.alpha = userSettings.map.territoryOpacity;

      const check = (ix: number, iy: number) => {
        const point = playerSamplePoints[ix]?.[iy];
        return point && point === player;
      }

      const getLinesX = (idx: number) => (cellOrigin: { x: number, y: number }) => (offset: number) => VERTEX_TABLE[idx][LINES_INDEX][offset].x * CELL_SIZE + cellOrigin.x;
      const getLinesY = (idx: number) => (cellOrigin: { x: number, y: number }) => (offset: number) => VERTEX_TABLE[idx][LINES_INDEX][offset].y * CELL_SIZE + cellOrigin.y;

      let combining = false
      for (let ix = 0; ix < samplePoints.length - 1; ix++) {
        for (let iy = 0; iy < samplePoints[ix].length - 1; iy++) {
          let alpha = userSettings.map.territoryOpacity;

          let lookUpIndex = 0
          lookUpIndex += (check(ix, iy) ? 1 : 0) * 8
          lookUpIndex += (check(ix + 1, iy) ? 1 : 0) * 4
          lookUpIndex += (check(ix, iy + 1) ? 1 : 0) * 1
          lookUpIndex += (check(ix + 1, iy + 1) ? 1 : 0) * 2

          if (VERTEX_TABLE[lookUpIndex][ACTION_INDEX] != VertexAction.ACTION_SKIP) {
            const cellOrigin = { x: ix * CELL_SIZE + minX, y: iy * CELL_SIZE + minY }

            const getX = getLinesX(lookUpIndex)(cellOrigin);
            const getY = getLinesY(lookUpIndex)(cellOrigin);

            // skipped for combine
            if (VERTEX_TABLE[lookUpIndex][LINES_INDEX].length > 1) {
              //if there are vertices, draw the lines
              territoryLines.moveTo(getX(0), getY(0));
              territoryLines.lineTo(getX(1), getY(1));

              if (VERTEX_TABLE[lookUpIndex][LINES_INDEX].length > 2) {
                territoryLines.moveTo(getX(2), getY(2));
                territoryLines.lineTo(getX(3), getY(3));
              }
            }

            if (VERTEX_TABLE[lookUpIndex][ACTION_INDEX] == VertexAction.ACTION_NEW) {
              if (combining) {
                //finish combining
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INDEX][1].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[15][POLYGON_INDEX][1].y * CELL_SIZE + cellOrigin.y)
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INDEX][0].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[15][POLYGON_INDEX][0].y * CELL_SIZE + cellOrigin.y)
                combining = false
              }
              territoryPolygons.moveTo(VERTEX_TABLE[lookUpIndex][POLYGON_INDEX][0].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[lookUpIndex][POLYGON_INDEX][0].y * CELL_SIZE + cellOrigin.y)
              alpha = 1;
              let first = true
              let vertices = VERTEX_TABLE[lookUpIndex][POLYGON_INDEX]
              for (let vertex of vertices) {
                if (first) { first = false; continue }
                territoryPolygons.lineTo(vertex.x * CELL_SIZE + cellOrigin.x, vertex.y * CELL_SIZE + cellOrigin.y)
              }
              territoryPolygons.fill({
                color,
                alpha,
              });

            }

            if (VERTEX_TABLE[lookUpIndex][ACTION_INDEX] == VertexAction.ACTION_COMBINE) {
              if (!combining) {
                //start combining
                territoryPolygons.moveTo(VERTEX_TABLE[15][POLYGON_INDEX][0].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[15][POLYGON_INDEX][0].y * CELL_SIZE + cellOrigin.y)
                alpha = 1;
                territoryPolygons.lineTo(VERTEX_TABLE[15][POLYGON_INDEX][1].x * CELL_SIZE + cellOrigin.x, VERTEX_TABLE[15][POLYGON_INDEX][1].y * CELL_SIZE + cellOrigin.y)
                combining = true
              }
            }
          }
        }
      }

      territoryLines.stroke({
        width: LINE_WIDTH,
        color,
        alpha: 1,
        cap: 'round',
      })
    }
  }

  _drawTerritoriesVoronoi(userSettings: UserGameSettings) {
    this.container.alpha = 1

    const voronoi = new Voronoi.Voronoi()

    const minX = gameHelper.calculateMinStarX(this.game!)
    const minY = gameHelper.calculateMinStarY(this.game!)
    const maxX = gameHelper.calculateMaxStarX(this.game!)
    const maxY = gameHelper.calculateMaxStarY(this.game!)

    const boundingBox = {
      xl: minX - MAX_VORONOI_DISTANCE,
      xr: maxX + MAX_VORONOI_DISTANCE,
      yt: minY - MAX_VORONOI_DISTANCE,
      yb: maxY + MAX_VORONOI_DISTANCE
    }

    let sites: Site[] = []
    for (let star of this.game!.galaxy.stars) {
      sites.push({
        x: star.location.x,
        y: star.location.y,
        playerID: star.ownedByPlayerId
      })
    }

    let diagram = voronoi.compute(sites, boundingBox)

    let borders: {
      lSite: Site,
      rSite: Site,
      va: any,
      vb: any
    }[] = [
    ];

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
      let star = this.game!.galaxy.stars.find(s => s.location.x === cell.site.x && s.location.y === cell.site.y)!;

      let colour = 0x000000

      if (star.ownedByPlayerId) {
        colour = Number.parseInt(this.context!.getPlayerColour(star.ownedByPlayerId));
      }

      let points: Position[] = []

      for (let halfedge of cell.halfedges) {
        points.push(halfedge.getStartpoint())
        points.push(halfedge.getEndpoint())
      }

      // Do not draw points that are more than X distance away from the star.
      // let sanitizedPoints = points
      let sanitizedPoints = points.map(getPoint)

      if (sanitizedPoints.length) {
        // Draw the graphic
        let territoryGraphic = new Graphics()
        territoryGraphic.moveTo(sanitizedPoints[0].x, sanitizedPoints[0].y)

        for (let point of sanitizedPoints) {
          territoryGraphic.lineTo(point.x, point.y)
        }

        // Draw another line back to the origin.
        territoryGraphic.lineTo(sanitizedPoints[0].x, sanitizedPoints[0].y)

        territoryGraphic.fill({
          color: colour,
          alpha: 0.3,
        });

        this.container.addChild(territoryGraphic)
      }
    }
    // ----------

    // Draw the cell territory borders
    borderWidth = +userSettings.map.voronoiTerritoryBorderWidth

    let borderGraphics = new Graphics()

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
        colour = Number.parseInt(this.context!.getPlayerColour(border.lSite.playerID));
      }

      borderGraphics.moveTo(rightVA.x, rightVA.y)
      borderGraphics.lineTo(rightVB.x, rightVB.y)
      borderGraphics.stroke({
        width: borderWidth,
        color: colour,
      });

      colour = 0x000000

      if (border.rSite.playerID) {
        colour = Number.parseInt(this.context!.getPlayerColour(border.rSite.playerID));
      }

      borderGraphics.moveTo(leftVA.x, leftVA.y)
      borderGraphics.lineTo(leftVB.x, leftVB.y)
      borderGraphics.stroke({
        width: borderWidth,
        color: colour,
      });
    }

    this.container.addChild(borderGraphics)
  }

  _sanitizeVoronoiPoint(site: Location, point: Location) {
    const distance = gameHelper.getDistanceBetweenLocations(site, point)
    const angle = gameHelper.getAngleBetweenLocations(site, point)

    if (distance > MAX_VORONOI_DISTANCE) {
      return gameHelper.getPointFromLocation(site, angle, MAX_VORONOI_DISTANCE)
    }

    return point;
  }

  refreshZoom(zoomPercent: number) {
    this.zoomPercent = zoomPercent

    if (this.container) {
      this.container.visible = zoomPercent <= this.userSettings.map.zoomLevels.territories;
    }
  }

}

export default Territories
