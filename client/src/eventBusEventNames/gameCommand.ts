import type { Carrier, Game, Star } from "@/types/game";
import type {EventBusEventName} from "./eventBusEventName";
import {type MapObject, makeCastFunc, type Location, type UserGameSettings} from "@solaris-common";

export type GameCommandEventBusEventType = { gameCommandEventBusEventType: 'GameCommandEventBusEventType' };
export type GameCommandEventBusEventName<TData> = EventBusEventName<GameCommandEventBusEventType, TData> & { gameCommandEventBusEventType: 'gameCommandEventBusEventType' };

const toEventName: <TData>(value: string) => GameCommandEventBusEventName<TData> = makeCastFunc();

export default class GameCommandEventBusEventNames {
  private constructor() {};

  public static readonly GameCommandReloadGame: GameCommandEventBusEventName<{ game: Game, settings: UserGameSettings }> = toEventName("reloadGame");
  public static readonly GameCommandReloadStar: GameCommandEventBusEventName<{ star: Star }> = toEventName("reloadStar");
  public static readonly GameCommandReloadCarrier: GameCommandEventBusEventName<{ carrier: Carrier }> = toEventName("reloadCarrier");
  public static readonly GameCommandRemoveCarrier: GameCommandEventBusEventName<{ carrier: Carrier }> = toEventName("removeCarrier");
}
