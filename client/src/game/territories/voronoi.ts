import type {Location, UserGameSettings} from "@solaris-common";
import gameHelper from "@/services/gameHelper";
import type {Game} from "@/types/game";
import type {DrawingContext} from "@/game/container";
import { Container, Graphics } from 'pixi.js';
import Voronoi from '../../voronoi/Javascript-Voronoi/rhill-voronoi-core.js';

const MAX_VORONOI_DISTANCE = 200

type Site = {
  x: number;
  y: number;
  playerID: string | null;
}

type Position = {
  x: number;
  y: number;
}

const _sanitizeVoronoiPoint = (site: Location, point: Location) => {
  const distance = gameHelper.getDistanceBetweenLocations(site, point)
  const angle = gameHelper.getAngleBetweenLocations(site, point)

  if (distance > MAX_VORONOI_DISTANCE) {
    return gameHelper.getPointFromLocation(site, angle, MAX_VORONOI_DISTANCE)
  }

  return point;
}

export const drawTerritoriesVoronoi = (game: Game, userSettings: UserGameSettings, context: DrawingContext, container: Container) => {
  container.alpha = 1;

  const voronoi = new Voronoi.Voronoi();

  const minX = gameHelper.calculateMinStarX(game);
  const minY = gameHelper.calculateMinStarY(game);
  const maxX = gameHelper.calculateMaxStarX(game);
  const maxY = gameHelper.calculateMaxStarY(game);

  const boundingBox = {
    xl: minX - MAX_VORONOI_DISTANCE,
    xr: maxX + MAX_VORONOI_DISTANCE,
    yt: minY - MAX_VORONOI_DISTANCE,
    yb: maxY + MAX_VORONOI_DISTANCE
  };

  let sites: Site[] = []

  for (let star of game.galaxy.stars) {
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
      let newPoint = _sanitizeVoronoiPoint(cell.site, endpoint)
      let ListPoints = allPoints.get(endpoint)
      if (ListPoints.every(point => point.x !== newPoint.x && point.y !== newPoint.y)) ListPoints.push(newPoint)
    } else {
      allPoints.set(endpoint, [_sanitizeVoronoiPoint(cell.site, endpoint)])
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
    let star = game.galaxy.stars.find(s => s.location.x === cell.site.x && s.location.y === cell.site.y)!;

    let colour = 0x000000

    if (star.ownedByPlayerId) {
      colour = Number.parseInt(context.getPlayerColour(star.ownedByPlayerId));
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

      container.addChild(territoryGraphic);
    }
  }

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
      colour = Number.parseInt(context.getPlayerColour(border.lSite.playerID));
    }

    borderGraphics.moveTo(rightVA.x, rightVA.y)
    borderGraphics.lineTo(rightVB.x, rightVB.y)
    borderGraphics.stroke({
      width: borderWidth,
      color: colour,
    });

    colour = 0x000000

    if (border.rSite.playerID) {
      colour = Number.parseInt(context.getPlayerColour(border.rSite.playerID));
    }

    borderGraphics.moveTo(leftVA.x, leftVA.y)
    borderGraphics.lineTo(leftVB.x, leftVB.y)
    borderGraphics.stroke({
      width: borderWidth,
      color: colour,
    });
  }

  container.addChild(borderGraphics);
}
