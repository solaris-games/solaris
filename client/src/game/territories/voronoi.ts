import type {UserGameSettings} from "@solaris/common";
import type {Game} from "@/types/game";
import type {DrawingContext} from "@/game/container";
import {Container, Graphics} from 'pixi.js';
import {Delaunay} from 'd3-delaunay';
import {colorFromString} from "@/util/colour";
import gameHelper from "@/services/gameHelper";

const MAX_VORONOI_DISTANCE = 50;

export const drawTerritoriesVoronoi = (game: Game, userSettings: UserGameSettings, context: DrawingContext, container: Container) => {
  container.alpha = 1;

  const stars = game.galaxy.stars;
  if (stars.length === 0) return;

  const minX = gameHelper.calculateMinStarX(game);
  const minY = gameHelper.calculateMinStarY(game);
  const maxX = gameHelper.calculateMaxStarX(game);
  const maxY = gameHelper.calculateMaxStarY(game);

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

  const starCells = stars.map((_, i) => voronoi.cellPolygon(i));

  const borderWidth = userSettings.map.voronoiTerritoryBorderWidth;
  if (borderWidth <= 0) return;

  const borderGraphics = new Graphics();

  for (let i = 0; i < starCells.length; i++){
    let cell = starCells[i];
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

    // Build an edge set for cell i: key "ax,ay,bx,by" for each directed edge a→b
    const ciEdgeSet = new Set<string>();
    for (let k = 0; k + 1 < cell.length; k++) {
      const a = cell[k], b = cell[k + 1];
      ciEdgeSet.add(`${a[0]},${a[1]},${b[0]},${b[1]}`);
    }

    for (const j of delaunay.neighbors(i)) {
      if (j <= i) continue; // process each pair once
      if (playerIDs[i] === playerIDs[j]) continue;

      const cj = starCells[j];
      if (!cj) continue;

      // The shared Voronoi edge appears as a→b in cell i and b→a in cell j.
      // Iterate cell j edges (each b→a) and look for a→b in cell i's edge set.
      let sharedA: [number, number] | null = null;
      let sharedB: [number, number] | null = null;

      for (let k = 0; k + 1 < cj.length; k++) {
        const b = cj[k], a = cj[k + 1];
        if (ciEdgeSet.has(`${a[0]},${a[1]},${b[0]},${b[1]}`)) {
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
  }

  container.addChild(borderGraphics);
}
