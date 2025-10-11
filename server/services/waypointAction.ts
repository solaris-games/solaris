import {Game} from "./types/Game";
import {Carrier} from "./types/Carrier";
import {Star} from "./types/Star";
import {CarrierWaypoint, CarrierWaypointActionType} from "solaris-common";
import {DBObjectId} from "./types/DBObjectId";
import {CarrierActionWaypoint} from "./types/GameTick";

export default class WaypointActionService {
    performWaypointAction(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        if (carrier.ownedByPlayerId!.toString() !== star.ownedByPlayerId!.toString()) {
            throw new Error('Cannot perform waypoint action, the carrier and star are owned by different players.')
        }

        switch (waypoint.action) {
            case 'dropAll':
                this._performWaypointActionDropAll(carrier, star, waypoint);
                break;
            case 'drop':
                this._performWaypointActionDrop(carrier, star, waypoint);
                break;
            case 'dropPercentage':
                this._performWaypointActionDropPercentage(carrier, star, waypoint);
                break;
            case 'dropAllBut':
                this._performWaypointActionDropAllBut(carrier, star, waypoint);
                break;
            case 'collectAll':
                this._performWaypointActionCollectAll(carrier, star, waypoint);
                break;
            case 'collect':
                this._performWaypointActionCollect(carrier, star, waypoint);
                break;
            case 'collectPercentage':
                this._performWaypointActionCollectPercentage(carrier, star, waypoint);
                break;
            case 'collectAllBut':
                this._performWaypointActionCollectAllBut(carrier, star, waypoint);
                break;
            case 'garrison':
                this._performWaypointActionGarrison(carrier, star, waypoint);
                break;
        }
    }

    _performWaypointActionDropAll(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        star.shipsActual! += (carrier.ships! - 1)
        star.ships = Math.floor(star.shipsActual!);
        carrier.ships = 1;
    }

    _performWaypointActionCollectAll(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        carrier.ships! += star.ships!;
        star.shipsActual! -= star.ships!;
        star.ships = Math.floor(star.shipsActual!);
    }

    _performWaypointActionDrop(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        // If the carrier has more ships than needs to be dropped, then drop
        // however many are configured in the waypoint.
        if (carrier.ships! - 1 >= waypoint.actionShips) {
            star.shipsActual! += waypoint.actionShips;
            star.ships = Math.floor(star.shipsActual!);
            carrier.ships! -= waypoint.actionShips;
        }
        else {
            // If there aren't enough ships, then do a drop all.
            this._performWaypointActionDropAll(carrier, star, waypoint);
        }
    }

    performWaypointActionsDrops(game: Game, waypoints: CarrierActionWaypoint[]) {
        this._performFilteredWaypointActions(game, waypoints, ['dropAll', 'drop', 'dropAllBut', 'dropPercentage']);
    }

    _performWaypointActionCollect(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        // If the star has more ships than needs to be collected, then collect
        // however many are configured in the waypoint.
        if (star.ships! >= waypoint.actionShips) {
            star.shipsActual! -= waypoint.actionShips;
            star.ships = Math.floor(star.shipsActual!);
            carrier.ships! += waypoint.actionShips;
        }
        else {
            // If there aren't enough ships, then do a collect all.
            this._performWaypointActionCollectAll(carrier, star, waypoint);
        }
    }

    performWaypointActionsCollects(game: Game, waypoints: CarrierActionWaypoint[]) {
        this._performFilteredWaypointActions(game, waypoints, ['collectAll', 'collect', 'collectAllBut', 'collectPercentage']);
    }

    _performWaypointActionDropPercentage(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        const toDrop = Math.floor(carrier.ships! * (waypoint.actionShips * 0.01))

        if (toDrop >= 1 && carrier.ships! - toDrop >= 1) {
            star.shipsActual! += toDrop
            star.ships = Math.floor(star.shipsActual!)
            carrier.ships! -= toDrop
        }
    }

    _performWaypointActionDropAllBut(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        // Calculate the difference between how many ships we currently have
        // and how many need to remain after.
        let difference = carrier.ships! - waypoint.actionShips;

        // If we have more than enough ships to transfer, then transfer
        // the desired amount. Otherwise do not drop anything.
        if (difference > 0 && difference <= carrier.ships! - 1) {
            star.shipsActual! += difference;
            star.ships = Math.floor(star.shipsActual!);
            carrier.ships! -= difference;
        }
    }

    _performWaypointActionCollectPercentage(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        const toTransfer = Math.floor(star.ships! * (waypoint.actionShips * 0.01))

        if (toTransfer >= 1 && star.ships! - toTransfer >= 0) {
            star.shipsActual! -= toTransfer
            star.ships = Math.floor(star.shipsActual!)
            carrier.ships! += toTransfer
        }
    }

    _performWaypointActionCollectAllBut(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        // Calculate the difference between how many ships we currently have
        // and how many need to remain after.
        let difference = star.ships! - waypoint.actionShips;

        // If we have more than enough ships to transfer, then transfer
        // the desired amount. Otherwise do not drop anything.
        if (difference > 0 && difference <= star.ships!) {
            star.shipsActual! -= difference;
            star.ships = Math.floor(star.shipsActual!);
            carrier.ships! += difference;
        }
    }

    _performWaypointActionGarrison(carrier: Carrier, star: Star, waypoint: CarrierWaypoint<DBObjectId>) {
        // Calculate how many ships need to be dropped or collected
        // in order to garrison the star.
        let difference = star.ships! - waypoint.actionShips;

        // If the difference is above 0 then move ships
        // from the star to the carrier, otherwise do the opposite.
        if (difference > 0) {
            let allowed = Math.abs(Math.min(difference, star.ships!));

            star.shipsActual! -= allowed;
            carrier.ships! += allowed;
        } else {
            let allowed = Math.min(Math.abs(difference), carrier.ships! - 1);

            star.shipsActual! += allowed;
            carrier.ships! -= allowed;
        }

        star.ships = Math.floor(star.shipsActual!);
    }

    performWaypointActionsGarrisons(game: Game, waypoints: CarrierActionWaypoint[]) {
        this._performFilteredWaypointActions(game, waypoints, ['garrison']);
    }

    _performFilteredWaypointActions(game: Game, waypoints: CarrierActionWaypoint[], waypointTypes: CarrierWaypointActionType[]) {
        let actionWaypoints = waypoints.filter(w =>
            waypointTypes.indexOf(w.waypoint.action) > -1
            && w.carrier.ownedByPlayerId!.toString() === w.star.ownedByPlayerId!.toString() // The carrier must be owned by the player who owns the star.
        );

        for (let actionWaypoint of actionWaypoints) {
            this.performWaypointAction(actionWaypoint.carrier, actionWaypoint.star, actionWaypoint.waypoint);
        }
    }
}