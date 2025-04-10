import { makeCastFunc } from "@solaris-common";
import type { EventBusEventName } from "./eventBusEventName";
import type { Star, Carrier } from "../types/game";
import type { TempWaypoint } from "../types/waypoint";
import type {RulerPoint} from "@/types/ruler";

export type MapEventBusEventType = { mapEventBusEventType: 'mapEventBusEventType' };
export type MapEventBusEventName<TData> = EventBusEventName<MapEventBusEventType, TData> & { mapEventBusEventType: 'mapEventBusEventType' };

const toEventName: <TData>(value: string) => MapEventBusEventName<TData> = makeCastFunc();

type StarClicked = {
  type: 'star',
  data: Star,
}

type CarrierClicked = {
  type: 'carrier',
  data: Carrier,
}

type ObjectClickedData = StarClicked | CarrierClicked;

export type ObjectClicked = {
  distance: number,
} & ObjectClickedData;

export default class MapEventBusEventNames {
  private constructor() {};

  public static readonly MapOnStarClicked: MapEventBusEventName<{ star: Star }> = toEventName('onStarClicked');
  public static readonly MapOnStarRightClicked: MapEventBusEventName<{ star: Star }> = toEventName("onStarRightClicked");
  public static readonly MapOnCarrierClicked: MapEventBusEventName<{ carrier: Carrier }> = toEventName('onCarrierClicked');
  public static readonly MapOnCarrierRightClicked: MapEventBusEventName<{ carrier: Carrier }> = toEventName("onCarrierRightClicked");
  public static readonly MapOnWaypointCreated: MapEventBusEventName<{ waypoint: TempWaypoint }> = toEventName("onWaypointCreated");
  public static readonly MapOnObjectsClicked: MapEventBusEventName<{ objects: ObjectClicked[]  }> = toEventName("onObjectsClicked");
  public static readonly MapOnWaypointOutOfRange: MapEventBusEventName<{}> = toEventName("onWaypointOutOfRange");
  public static readonly MapOnRulerPointCreated: MapEventBusEventName<{ rulerPoint: RulerPoint }> = toEventName("onRulerPointCreated");
  public static readonly MapOnRulerPointRemoved: MapEventBusEventName<{ rulerPoint: RulerPoint }> = toEventName("onRulerPointRemoved");
  public static readonly MapOnRulerPointsCleared: MapEventBusEventName<{}> = toEventName("onRulerPointsCleared");
}
