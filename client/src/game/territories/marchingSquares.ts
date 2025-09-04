import { Container, Graphics } from 'pixi.js';
import type {UserGameSettings} from "@solaris-common";
import type {Game, Player} from "@/types/game";
import type {DrawingContext} from "@/game/container";
import gameHelper from "@/services/gameHelper";

type SamplePoint = {
  distance: number;
  owner: Player | undefined;
}

enum VertexAction {
  ACTION_COMBINE = 1,
  ACTION_NEW = 2,
  ACTION_SKIP = 0,
}

const ACTION_INDEX = 0;
const LINES_INDEX = 1;
const POLYGON_INDEX = 2;

type Position = {
  x: number;
  y: number;
}

type VertexSpec = [VertexAction, Position[], Position[]];

export const drawTerritoriesMarchingSquare = (game: Game, userSettings: UserGameSettings, context: DrawingContext, container: Container) => {
  container.alpha = 1;

  const CELL_SIZE = 5 * userSettings.map.marchingSquareGridSize;
  const METABALL_RADIUS = 20 * userSettings.map.marchingSquareTerritorySize;
  const LINE_PROPORTION = (1 / 16) * userSettings.map.marchingSquareBorderWidth;
  const LINE_WIDTH = CELL_SIZE * LINE_PROPORTION;
  const LINE_OFFSET = LINE_PROPORTION / 2;

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
  ];

  let minX = gameHelper.calculateMinStarX(game);
  let minY = gameHelper.calculateMinStarY(game);
  let maxX = gameHelper.calculateMaxStarX(game);
  let maxY = gameHelper.calculateMaxStarY(game);

  minX -= minX % CELL_SIZE;
  minX -= Math.floor(METABALL_RADIUS * 1.5 / CELL_SIZE) * CELL_SIZE;
  minY -= minY % CELL_SIZE;
  minY -= Math.floor(METABALL_RADIUS * 1.5 / CELL_SIZE) * CELL_SIZE;
  maxX -= maxX % CELL_SIZE;
  maxX += CELL_SIZE;
  maxX += Math.floor(METABALL_RADIUS * 1.5 / CELL_SIZE) * CELL_SIZE;
  maxY -= maxY % CELL_SIZE;
  maxY += CELL_SIZE;
  maxY += Math.floor(METABALL_RADIUS * 1.5 / CELL_SIZE) * CELL_SIZE;

  if (minX < 0) {
    minX -= CELL_SIZE;
  }
  if (minY < 0) {
    minY -= CELL_SIZE;
  }

  const gridWidth = (maxX - minX) / CELL_SIZE
  const gridHeight = (maxY - minY) / CELL_SIZE

  const samplePoints: SamplePoint[][] = Array.from(Array(gridWidth + 1), () => new Array(gridHeight + 1));

  const gridToCoord = (ix: number, iy: number) => {
    return {
      x: ix * CELL_SIZE + minX,
      y: iy * CELL_SIZE + minY
    }
  }

  const stars = game.galaxy.stars;

  for (let star of stars) {
    // This loop goes through all stars, and generates the gridPoints that are within the METABALL_RADIUS
    // Those points get the value of this star, or keep their previous value (from another star) if that one was closer
    const startIX = Math.ceil((star.location.x - METABALL_RADIUS - minX) / CELL_SIZE); //The minimum ix can be and still be in the METABALL_RADIUS
    const endIX = Math.floor((star.location.x + METABALL_RADIUS - minX) / CELL_SIZE); //The maximum ix can be and still be in the METABALL_RADIUS

    for (let ix = startIX; ix <= endIX; ix++) {
      const startIY = Math.ceil((star.location.y - Math.sqrt((METABALL_RADIUS)**2 - (star.location.x - (ix * CELL_SIZE + minX))**2) - minY) / CELL_SIZE); // The minimum iy can be and still be in the METABALL_RADIUS
      const endIY = Math.floor((star.location.y + Math.sqrt((METABALL_RADIUS)**2 - (star.location.x - (ix * CELL_SIZE + minX))**2) - minY) / CELL_SIZE); // The maximum iy can be and still be in the METABALL_RADIUS

      for (let iy = startIY; iy <= endIY; iy++) {
        const gridLocation = gridToCoord(ix, iy); // Get the location in x, y of the gridPoint we are currently looping through
        const distance = gameHelper.getDistanceBetweenLocations(gridLocation, star.location); // Get the distance between the gridPoint and the star

        if (samplePoints[ix][iy] && samplePoints[ix][iy].distance < distance) { // If the gridpoint has a value AND the distance currently logged (from a previous star) is smaller than the current one THEN don't log anything
          // Do nothing, because the grid already has a value from a star that is closer
        } else {
          // Now either the grid doesn't have a value here yet or the star calculated here is closer than the one currently logged in

          const owner = game.galaxy.players.find(p => p._id === star.ownedByPlayerId);

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

  for (let player of game.galaxy.players) {
    const color = context.getPlayerColour(player._id)
    const territoryPolygons = new Graphics()
    const territoryLines = new Graphics()
    container.addChild(territoryPolygons);
    container.addChild(territoryLines);
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
    });
  }
}
