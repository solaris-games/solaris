import type { GameState } from "@solaris-common";
import { makeCastFunc } from "@solaris-common";
import type { EventBusEventName } from "./eventBusEventName";

export type GameEventBusEventType = { gameEventBusEventType: 'gameEventBusEventType' };
export type GameEventBusEventName<TData> = EventBusEventName<GameEventBusEventType, TData> & { gameEventBusEventName: 'gameEventBusEventName' }

const toEventName: <TData>(value: string) => GameEventBusEventName<TData> = makeCastFunc();

export default class GameEventBusEventNames {
  private constructor() { };

  public static readonly GameStarted: GameEventBusEventName<{ state: GameState<string> }> = toEventName('gameStarted');
  public static readonly OnGameTick: GameEventBusEventName<void> = toEventName('onGameTick');
}
