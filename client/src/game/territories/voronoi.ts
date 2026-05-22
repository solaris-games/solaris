import {minBy, type UserGameSettings} from "@solaris/common";
import type {Game, Star} from "@/types/game";
import type {DrawingContext} from "@/game/container";
import {Container, Graphics} from 'pixi.js';
import {Delaunay} from 'd3-delaunay';
import {colorFromString} from "@/util/colour";
import gameHelper from "@/services/gameHelper";
import helpers from "@/game/helpers";

const MAX_VORONOI_DISTANCE = 50;

const computeCommonEdges = (cell: Delaunay.Point[]) => {
  // Build an edge set for cell i: key "ax,ay,bx,by" for each directed edge a→b
  const ciEdgeSet = new Set<string>();
  for (let k = 0; k + 1 < cell.length; k++) {
    const a = cell[k], b = cell[k + 1];
    ciEdgeSet.add(`${a[0]},${a[1]},${b[0]},${b[1]}`);
  }
  return ciEdgeSet;
};

type P = [number, number];

const renderBorders = (cell: Delaunay.Point[], delaunay: Delaunay<unknown>, i: number, playerIDs: (string | null)[], starCells: Delaunay.Point[][], borderWidth: number, context: DrawingContext, borderGraphics) => {
  const commonEdgeSet = computeCommonEdges(cell);

  for (const j of delaunay.neighbors(i)) {
    if (j <= i) continue; // process each pair once
    if (playerIDs[i] === playerIDs[j]) continue;

    const cj = starCells[j];
    if (!cj) continue;

    // The shared Voronoi edge appears as a→b in cell i and b→a in cell j.
    // Iterate cell j edges (each b→a) and look for a→b in cell i's edge set.
    let sharedA: P | null = null;
    let sharedB: P | null = null;

    for (let k = 0; k + 1 < cj.length; k++) {
      const b = cj[k], a = cj[k + 1];
      if (commonEdgeSet.has(`${a[0]},${a[1]},${b[0]},${b[1]}`)) {
        sharedA = a;
        sharedB = b;
        break;
      }
    }

    if (!sharedA || !sharedB) continue;

    const [ax, ay] = sharedA;
    const [bx, by] = sharedB;

    const angle = Math.atan2(by - ay, bx - ax);
    const halfW = borderWidth / 2;
    const leftAngle = angle + Math.PI / 2;
    const rightAngle = angle - Math.PI / 2;
    const clx = Math.cos(leftAngle) * halfW;
    const cly = Math.sin(leftAngle) * halfW;
    const crx = Math.cos(rightAngle) * halfW;
    const cry = Math.sin(rightAngle) * halfW;

    // Left side of a→b is cell i's territory; right side is cell j's
    const colourI = playerIDs[i]
      ? colorFromString(context.getPlayerColour(playerIDs[i]!))
      : 0x000000;
    const colourJ = playerIDs[j]
      ? colorFromString(context.getPlayerColour(playerIDs[j]!))
      : 0x000000;

    borderGraphics.moveTo(ax + clx, ay + cly);
    borderGraphics.lineTo(bx + clx, by + cly);
    borderGraphics.stroke({width: borderWidth, color: colourI});

    borderGraphics.moveTo(ax + crx, ay + cry);
    borderGraphics.lineTo(bx + crx, by + cry);
    borderGraphics.stroke({width: borderWidth, color: colourJ});
  }
};

const computeConvexHull = (points: P[]): P[] => {
  // Graham scan

  const stack: P[] = [];

  points.sort((a, b) => {
    const d = a[1] - b[1];

    if (d === 0) {
      return a[0] - b[0];
    } else {
      return d;
    }
  });

  const ccw = (a: P, b: P, c: P) => {
    const v = a[0] * (b[1] - c[1]) +
      b[0] * (c[1] - a[1]) +
      c[0] * (a[1] - b[1]);
    if (v < 0) {
      return -1;
    }
    if (v > 0) {
      return +1;
    }
    return 0;
  };

  const p0 = points[0];

  points.sort((a, b) => {
    const dax = a[0] - p0[0];
    const day = a[1] - p0[1];
    const dbx = b[0] - p0[0];
    const dby = b[1] - p0[1];

    const angleA = Math.atan2(day, dax);
    const angleB = Math.atan2(dby, dbx);

    return angleA - angleB;
  });

  for (let point of points) {
    while (stack.length > 1 && ccw(stack[stack.length - 2], stack[stack.length - 1], point) <= 0) {
      stack.pop();
    }
    stack.push(point);
  }

  return stack;
};

const computeIntersection = (prevPoint: P, currentPoint: P, edgeS: P, edgeE: P): P => {
  let x: number;
  let y: number;

  if (currentPoint[0] - prevPoint[0] === 0) {
    x = prevPoint[0];

    const m2 = (edgeE[1] - edgeS[1]) / (edgeE[0] - edgeS[0]);
    const b2 = edgeS[1] - m2 * edgeS[0];

    y = m2 * x + b2;
  } else if (edgeE[0] - edgeS[0] === 0) {
    x = edgeS[0];

    const m1 = (currentPoint[1] - prevPoint[1]) / (currentPoint[0] - prevPoint[0]);
    const b1 = currentPoint[1] - m1 * currentPoint[0];

    y = m1 * x + b1;
  } else {
    const m1 = (currentPoint[1] - prevPoint[1]) / (currentPoint[0] - prevPoint[0]);
    const b1 = currentPoint[1] - m1 * currentPoint[0];

    const m2 = (edgeE[1] - edgeS[1]) / (edgeE[0] - edgeS[0]);
    const b2 = edgeS[1] - m2 * edgeS[0];

    x = (b2 - b1) / (m1 - m2);
    y = m1 * x + b1;
  }

  return [x, y];
};

const isInside = (point: P, edgeS: P, edgeE: P) => {
  const d = (point[0] - edgeS[0]) * (edgeE[1] - edgeS[1]) - (point[1] - edgeS[1]) * (edgeE[0] - edgeS[0]);

  return d < 0;
};

const mod = (n: number, d: number) => ((n % d) + d) % d;

const clip = (subjectPoly: P[], clipPoly: P[]): P[] => {
  let outList = subjectPoly;

  for (let i = 0; i < clipPoly.length; i++) {
    const edgeS = clipPoly[i];
    const edgeE = clipPoly[mod(i + 1, clipPoly.length)];
    const inList = outList;
    outList = [];
    for (let j = 0; j < inList.length; j++) {
      const currentPoint = inList[j];
      const prevPoint = inList[mod(j - 1, inList.length)];

      const intersection = computeIntersection(prevPoint, currentPoint, edgeS, edgeE);

      if (isInside(currentPoint, edgeS, edgeE)) {
        if (!isInside(prevPoint, edgeS, edgeE)) {
          outList.push(intersection);
        }
        outList.push(currentPoint);
      } else if (isInside(prevPoint, edgeS, edgeE)) {
        outList.push(intersection);
      }
    }
  }

  return outList;
}

const SCALE = 1.1;

const scalePoints = (points: P[]): P[] => {
  const center = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]).map(c => c / points.length) as P;

  return points.map((p) => {
    const dx = p[0] - center[0];
    const dy = p[1] - center[1];

    const ndx = dx * SCALE;
    const ndy = dy * SCALE;

    return [center[0] + ndx, center[1] + ndy];
  });
};

export const drawTerritoriesVoronoi = (game: Game, userSettings: UserGameSettings, context: DrawingContext, container: Container) => {
  container.alpha = 1;

  const stars = game.galaxy.stars;
  if (stars.length === 0) return;

  const minX = helpers.calculateMinStarX(game);
  const minY = helpers.calculateMinStarY(game);
  const maxX = helpers.calculateMaxStarX(game);
  const maxY = helpers.calculateMaxStarY(game);

  // Build flat coordinate array and player ID index
  const coords = new Float64Array(stars.length * 2);
  const playerIDs: (string | null)[] = new Array(stars.length);

  for (let i = 0; i < stars.length; i++) {
    coords[i * 2] = stars[i].location.x;
    coords[i * 2 + 1] = stars[i].location.y;
    playerIDs[i] = stars[i].ownedByPlayerId ?? null;
  }

  const delaunay = new Delaunay(coords);
  const bounds: [number, number, number, number] = [
    minX - MAX_VORONOI_DISTANCE,
    minY - MAX_VORONOI_DISTANCE,
    maxX + MAX_VORONOI_DISTANCE,
    maxY + MAX_VORONOI_DISTANCE,
  ];
  const voronoi = delaunay.voronoi(bounds);

  const alpha = userSettings.map.territoryOpacity;

  const starCellsUnclipped = stars.map((_, i) => voronoi.cellPolygon(i));

  const hullPointsUnscaled: P[] = stars.map(s => [s.location.x, s.location.y]);

  const hullPoints = scalePoints(hullPointsUnscaled);

  const hull = computeConvexHull(hullPoints);

  const starCells = starCellsUnclipped.map(cell => clip(cell, hull));

  console.warn({
    starCellsUnclipped,
    hull,
    starCells,
  });

  const borderWidth = userSettings.map.voronoiTerritoryBorderWidth;
  if (borderWidth <= 0) return;

  const borderGraphics = new Graphics();

  for (let i = 0; i < starCells.length; i++){
    const cell = starCells[i];
    if (!cell || cell.length < 3) continue;

    const colour = playerIDs[i]
      ? colorFromString(context.getPlayerColour(playerIDs[i]!))
      : 0x000000;

    const g = new Graphics();
    g.moveTo(cell[0][0], cell[0][1]);
    for (let j = 1; j < cell.length; j++) {
      g.lineTo(cell[j][0], cell[j][1]);
    }
    g.fill({color: colour, alpha});
    container.addChild(g);

    renderBorders(cell, delaunay, i, playerIDs, starCells, borderWidth, context, borderGraphics);
  }

  container.addChild(borderGraphics);
}
