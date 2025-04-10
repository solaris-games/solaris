import type {EventBusEventName} from "./eventBusEventName";
import {type MapObject, makeCastFunc, type Location} from "@solaris-common";
import type {Player} from "../types/game";

export type MapCommandEventBusEventType = { mapCommandEventBusEventType: 'mapCommandEventBusEventType' };
export type MapCommandEventBusEventName<TData> = EventBusEventName<MapCommandEventBusEventType, TData> & { mapEventBusEventType: 'mapEventBusEventType' };

const toEventName: <TData>(value: string) => MapCommandEventBusEventName<TData> = makeCastFunc();

export default class MapCommandEventBusEventNames {
  private constructor() {};

  public static readonly MapCommandPanToUser: MapCommandEventBusEventName<{}> = toEventName('panToUser');
  public static readonly MapCommandPanToObject: MapCommandEventBusEventName<{ object: MapObject<string> }> = toEventName('panToObject');
  public static readonly MapCommandPanToLocation: MapCommandEventBusEventName<{ location: Location }> = toEventName('panToLocation');
  public static readonly MapCommandPanToPlayer: MapCommandEventBusEventName<{ player: Player }> = toEventName('panToPlayer');
  public static readonly MapCommandClearHighlightedLocations: MapCommandEventBusEventName<{}> = toEventName('clearHighlightedLocations');
  public static readonly MapCommandHighlightLocation: MapCommandEventBusEventName<{ object: MapObject<string>, opacity: number }> = toEventName('highlightLocation');
  public static readonly MapCommandClickStar: MapCommandEventBusEventName<{ starId: string }> = toEventName('clickStar');
  public static readonly MapCommandClickCarrier: MapCommandEventBusEventName<{ carrierId: string }> = toEventName('clickCarrier');
  public static readonly MapCommandRemoveLastRulerPoint: MapCommandEventBusEventName<{}> = toEventName('removeLastRulerPoint');
  public static readonly MapCommandShowIgnoreBulkUpgrade: MapCommandEventBusEventName<{}> = toEventName('showIgnoreBulkUpgrade');
  public static readonly MapCommandHideIgnoreBulkUpgrade: MapCommandEventBusEventName<{}> = toEventName('hideIgnoreBulkUpgrade');
}
