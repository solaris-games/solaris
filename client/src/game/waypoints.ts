import * as PIXI from 'pixi.js'
import {EventEmitter} from "./eventEmitter";
import type {Game, Carrier as CarrierData, Star as StarData} from '../types/game';
import type { DrawingContext } from './container';
import type { TempWaypoint } from '@/types/waypoint';
import { createStarHighlight } from './highlight';
import {
  DistanceService,
  type Location,
  PathfindingService,
  TechnologyService,
  type UserGameSettings
} from "@solaris/common";
import { v7 as generateV7Uuid } from 'uuid';
import helpers from "@/game/helpers.ts";

type Events = {
  onWaypointCreated: TempWaypoint,
  onWaypointOutOfRange: null,
}

class Waypoints extends EventEmitter<keyof Events, Events> {
  container: PIXI.Container;
  game: Game;
  context: DrawingContext;
  lightYearDistance: number;
  carrier: CarrierData | undefined;
  settings: UserGameSettings;
  pathfindingService: PathfindingService<string>;
  distanceService: DistanceService;
  technologyService: TechnologyService;

  constructor (distanceService: DistanceService, technologyService: TechnologyService, pathfindingService: PathfindingService<string>, game: Game, context: DrawingContext, settings: UserGameSettings) {
    super();

    this.distanceService = distanceService;
    this.technologyService = technologyService;
    this.pathfindingService = pathfindingService;
    this.container = new PIXI.Container();
    this.game = game;
    this.context = context;
    this.lightYearDistance = game.constants.distances.lightYear;
    this.settings = settings;
  }

  update (game: Game, context: DrawingContext, settings: UserGameSettings) {
    this.game = game;
    this.context = context;
    this.lightYearDistance = game.constants.distances.lightYear;
    this.settings = settings;
  }

  clear () {
    this.container.removeChildren();
  }

  drawPath(carrier: CarrierData) {
    this.clear()
    this.carrier = carrier;
    this._drawPaths()
  }

  drawWaypointMode (carrier: CarrierData) {
    this.clear();
    this.carrier = carrier;
    this._drawHyperspaceRange();
    this._drawLastWaypoint();
    this._drawNextWaypoints();
    this._drawPaths();
  }

  _drawLastWaypoint () {
    // If there are no waypoints at all
    // then deem the current location as the waypoint.
    const lastLocation = this._getLastLocation();

    if (!lastLocation) {
      return;
    }

    // Draw a big selected highlight around the last waypoint.
    this._highlightLocation(lastLocation, 0.8)
  }

  _drawNextWaypoints () {
    if (!this.carrier) {
      return;
    }

    // Draw all of the available waypoints that the last waypoint can reach.
    const lastLocation = this._getLastLocation();

    if (!lastLocation) {
      return;
    }

    // Calculate which stars are in reach and draw highlights around them
    const effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(this.game, this.carrier!);
    const hyperspaceDistance = this.distanceService.getHyperspaceDistance(this.game, effectiveTechs.hyperspace);

    for (let i = 0; i < this.game!.galaxy.stars.length; i++) {
      let s = this.game!.galaxy.stars[i]

      let distance = this.distanceService.getDistanceBetweenLocations(lastLocation, s.location);

      if (distance <= hyperspaceDistance) {
        this._highlightLocation(s.location, 0.5)
      } else {
        this._highlightLocation(s.location, 0.2)
      }
    }
  }

  _drawPaths () {
    if (!this.carrier!.waypoints.length) {
      return
    }

    // Draw all paths to each waypoint the carrier currently has.
    // Start with the first waypoint's source location and then
    // go through each waypoint draw a line to their destinations.

    const graphics = new PIXI.Graphics()

    graphics.moveTo(this.carrier!.location.x, this.carrier!.location.y)

    // Draw a line to each destination along the waypoints.
    for (let i = 0; i < this.carrier!.waypoints.length; i++) {
      const waypoint = this.carrier!.waypoints[i];
      const star = this.game!.galaxy.stars.find(s => s._id === waypoint.destination);

      if (!star) {
        break;
      }

      graphics.lineTo(star.location.x, star.location.y)
    }

    graphics.stroke({
      width: 1,
      color: 0xFFFFFF,
      alpha: 0.8
    });

    this.container.addChild(graphics);
  }

  _drawHyperspaceRange () {
    const graphics = new PIXI.Graphics()
    // TODO: This is causing errors when a star is revealed in dark mode.
    const lastLocationStar = this._getLastLocationStar()
    const player = this.game!.galaxy.players.find(p => p.userId)

    const radius = ((this.carrier!.effectiveTechs!.hyperspace || 1) + 1.5) * this.lightYearDistance!

    const playerColour = this.context!.getPlayerColour(player!._id)

    graphics.star(lastLocationStar!.location.x, lastLocationStar!.location.y, radius, radius, radius - 3)

    graphics.fill({
      color: playerColour,
      alpha: 0.15
    });

    graphics.stroke({
      width: 1,
      color: playerColour,
      alpha: 0.2
    });

    this.container.addChild(graphics)
  }

  _highlightLocation (location: Location, alpha = 1) {
    const graphics = createStarHighlight(location, alpha);
    this.container.addChild(graphics);
  }

  onStarClicked (e: StarData) {
    if (!this.carrier) {
      return;
    }

    // If the selected star is inside of hyperspace range then
    // simply create a waypoint to it. Otherwise try to calculate the
    // shortest route to it.
    const effectiveTechs = this.technologyService.getCarrierEffectiveTechnologyLevels(this.game, this.carrier!);
    const hyperspaceDistance = this.distanceService.getHyperspaceDistance(this.game, effectiveTechs.hyperspace);

    const lastLocationStar = this._getLastLocationStar();
    const lastLocation = lastLocationStar == null ? null : lastLocationStar.location

    if (!lastLocation) {
      return;
    }

    const distance = this.distanceService.getDistanceBetweenLocations(lastLocation, e.location);

    let canCreateWaypoint = distance <= hyperspaceDistance;

    if (!canCreateWaypoint && lastLocationStar && lastLocationStar.wormHoleToStarId) {
      const wormHolePairStar = helpers.getStarById(this.game!, lastLocationStar.wormHoleToStarId);

      canCreateWaypoint = Boolean(wormHolePairStar && wormHolePairStar._id === e._id);
    }

    if (canCreateWaypoint) {
      this._createWaypoint(e._id);
    } else {
      this._createWaypointRoute(lastLocationStar!._id, e._id);
    }
  }

  _createWaypoint (destinationStarId: string) {
    let source: string;

    // If the carrier has waypoints, create a new waypoint from the last destination.
    if (this.carrier!.waypoints.length) {
      const lastWaypoint = this._getLastWaypoint();

      // // The waypoint cannot be the same as the previous waypoint.
      // if (newWaypoint.destination === lastWaypoint.destination) {
      //   return
      // }

      source = lastWaypoint.destination;
    } else { // Otherwise use the current orbiting star
      source = this.carrier!.orbiting!;
    }

    const newWaypoint = {
      destination: destinationStarId,
      action: this.settings?.carrier.defaultAction || 'collectAll',
      actionShips: this.settings?.carrier.defaultAmount || 0,
      delayTicks: 0,
      source,
    };

    this.carrier!.waypoints.push({
      _id: generateV7Uuid(),
      ...newWaypoint,
    });

    this.drawWaypointMode(this.carrier!);

    this.emit('onWaypointCreated', newWaypoint);
  }

  _createWaypointRoute (sourceStarId: string, destinStarId: string) {
    const route = this.pathfindingService.calculateShortestRoute(this.game, helpers.getPlayerById(this.game, this.carrier!.ownedByPlayerId!)!, this.carrier!, sourceStarId, destinStarId)

    if (route.length > 1) {
      for (let i = 1; i < route.length; i++) {
        const waypointStar = route[i];

        this._createWaypoint(waypointStar.id);
      }
    } else {
      this.emit('onWaypointOutOfRange', null);
    }
  }

  _getLastWaypoint () {
    return this.carrier!.waypoints[this.carrier!.waypoints.length - 1]
  }

  _getLastLocation () {
    const lastLocationStar = this._getLastLocationStar();

    if (lastLocationStar) {
      return lastLocationStar.location;
    }

    return null;
  }

  _getLastLocationStar () {
    if (this.carrier!.waypoints.length) {
      const lastWaypointStarId = this.carrier!.waypoints[this.carrier!.waypoints.length - 1].destination;

      return this.game!.galaxy.stars.find(s => s._id === lastWaypointStarId);
    } else {
      return this.game!.galaxy.stars.find(s => s._id === this.carrier!.orbiting);
    }
  }
}

export default Waypoints
