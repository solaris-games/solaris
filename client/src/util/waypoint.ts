import type {CarrierWaypoint, CarrierWaypointActionType} from "@solaris-common";

export const formatAction = (waypoint: CarrierWaypoint<string>, action: CarrierWaypointActionType) => {
  switch (action) {
    case 'nothing':
      return 'Do Nothing'
    case 'collectAll':
      return 'Collect All Ships'
    case 'dropAll':
      return 'Drop All Ships'
    case 'collect':
      return `Collect ${waypoint.actionShips} Ships`
    case 'drop':
      return `Drop ${waypoint.actionShips} Ships`
    case 'collectAllBut':
      return `Collect All But ${waypoint.actionShips} Ships`
    case 'dropAllBut':
      return `Drop All But ${waypoint.actionShips} Ships`
    case 'garrison':
      return `Garrison ${waypoint.actionShips} Ships`
    case 'collectPercentage':
      return `Collect ${waypoint.actionShips}% Of Ships`
    case 'dropPercentage':
      return `Drop ${waypoint.actionShips}% Of Ships`
  }
};

export const isActionRequiresShips = (action: CarrierWaypointActionType) => {
  switch (action) {
    case 'collect':
    case 'drop':
    case 'collectAllBut':
    case 'dropAllBut':
    case 'collectPercentage':
    case 'dropPercentage':
    case 'garrison':
      return true;
  }

  return false;
};

export const isFirstWaypoint = (allWaypoints: CarrierWaypoint<string>[], waypoint: CarrierWaypoint<string>) => {
  return allWaypoints.indexOf(waypoint) === 0;
}

