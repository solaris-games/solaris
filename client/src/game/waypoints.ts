import * as PIXI from 'pixi.js'
import GameHelper from '../services/gameHelper'
import WaypointHelper from '../services/waypointHelper'
import {EventEmitter} from "./eventEmitter";
import type {Game, Carrier as CarrierData} from '../types/game';
import type { DrawingContext } from './container';
import type { TempWaypoint } from '../types/waypoint';
import { createStarHighlight } from './highlight';
import type { Location } from "@solaris-common";

type Events = {
  onWaypointCreated: TempWaypoint,
  onWaypointOutOfRange: null,
}

class Waypoints extends EventEmitter<keyof Events, Events> {
  container: PIXI.Container;
  game: Game | undefined;
  context: DrawingContext | undefined;
  lightYearDistance: number | undefined;
  carrier: CarrierData | undefined;

  constructor () {
    super()

    this.container = new PIXI.Container()
  }

  setup (game: Game, context: DrawingContext) {
    this.game = game;
    this.context = context;
    this.lightYearDistance = game.constants.distances.lightYear;
  }

  clear () {
    this.container.removeChildren();
  }

  draw (carrier: CarrierData, plotting=true) {
    this.clear()

    this.carrier = carrier
    if (plotting) {
      this.drawHyperspaceRange()
      this.drawLastWaypoint()
      this.drawNextWaypoints()
    }
    this.drawPaths()
  }

  drawLastWaypoint () {
    // If there are no waypoints at all
    // then deem the current location as the waypoint.
    const lastLocation = this._getLastLocation();

    if (!lastLocation) {
      return;
    }

    // Draw a big selected highlight around the last waypoint.
    this._highlightLocation(lastLocation, 0.8)
  }

  drawNextWaypoints () {
    // Draw all of the available waypoints that the last waypoint can reach.
    let lastLocation = this._getLastLocation()
    let userPlayer = this.game!.galaxy.players.find(p => p.userId)

    // Calculate which stars are in reach and draw highlights around them
    const hyperspaceDistance = GameHelper.getHyperspaceDistance(this.game, userPlayer, this.carrier)

    for (let i = 0; i < this.game!.galaxy.stars.length; i++) {
      let s = this.game!.galaxy.stars[i]

      let distance = GameHelper.getDistanceBetweenLocations(lastLocation, s.location)

      if (distance <= hyperspaceDistance) {
        this._highlightLocation(s.location, 0.5)
      } else {
        this._highlightLocation(s.location, 0.2)
      }
    }
  }

  drawPaths () {
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

    this.container.addChild(graphics)
  }

  drawHyperspaceRange () {
    let graphics = new PIXI.Graphics()
    // TODO: This is causing errors when a star is revealed in dark mode.
    let lastLocationStar = this._getLastLocationStar()
    let player = this.game!.galaxy.players.find(p => p.userId)

    let radius = ((this.carrier!.effectiveTechs!.hyperspace || 1) + 1.5) * this.lightYearDistance!

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

  onStarClicked (e) {
    if (!this.carrier) {
      return
    }

    // If the selected star is inside of hyperspace range then
    // simply create a waypoint to it. Otherwise try to calculate the
    // shortest route to it.
    const userPlayer = this.game!.galaxy.players.find(p => p.userId)
    const hyperspaceDistance = GameHelper.getHyperspaceDistance(this.game, userPlayer, this.carrier)

    const lastLocationStar = this._getLastLocationStar()
    const lastLocation = lastLocationStar == null ? null : lastLocationStar.location
    const distance = GameHelper.getDistanceBetweenLocations(lastLocation, e.location)

    let canCreateWaypoint = distance <= hyperspaceDistance

    if (!canCreateWaypoint && lastLocationStar && lastLocationStar.wormHoleToStarId) {
      const wormHolePairStar = GameHelper.getStarById(this.game!, lastLocationStar.wormHoleToStarId)

      canCreateWaypoint = Boolean(wormHolePairStar && wormHolePairStar._id === e._id)
    }

    if (canCreateWaypoint) {
      this._createWaypoint(e._id)
    } else {
      this._createWaypointRoute(lastLocationStar!._id, e._id)
    }
  }

  _createWaypoint (destinationStarId: string) {
    let newWaypoint: TempWaypoint = {
      destination: destinationStarId,
      action: 'collectAll',
      actionShips: 0,
      delayTicks: 0,
      source: undefined,
    };

    // If the carrier has waypoints, create a new waypoint from the last destination.
    if (this.carrier!.waypoints.length) {
      const lastWaypoint = this._getLastWaypoint()

      // // The waypoint cannot be the same as the previous waypoint.
      // if (newWaypoint.destination === lastWaypoint.destination) {
      //   return
      // }

      newWaypoint.source = lastWaypoint.destination
    } else { // Otherwise use the current orbiting star
      newWaypoint.source = this.carrier!.orbiting
    }

    this.carrier!.waypoints.push(newWaypoint as any)

    this.draw(this.carrier!)

    this.emit('onWaypointCreated', newWaypoint)
  }

  _createWaypointRoute (sourceStarId: string, destinStarId: string) {
    const route = WaypointHelper.calculateShortestRoute(this.game, this.carrier, sourceStarId, destinStarId)

    if (route.length > 1) {
      for (let i = 1; i < route.length; i++) {
        let waypointStar = route[i]

        this._createWaypoint(waypointStar._id)
      }
    } else {
      this.emit('onWaypointOutOfRange', null)
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
