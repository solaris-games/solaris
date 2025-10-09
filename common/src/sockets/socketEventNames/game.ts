import { type GameState } from "../../types/common/game";
import { makeCastFunc } from "../../utilities/cast";
import { type EventName} from "../../events";

export type GameSocketEventType = { gameSocketEventType: 'gameSocketEventType' };
export type GameSocketEventName<TData> = EventName<GameSocketEventType, TData> & { gameSocketEventName: 'gameSocketEventName' };

const toEventName: <TData>(value: string) => GameSocketEventName<TData> = makeCastFunc();

export class GameSocketEventNames {
    private constructor() { };

    public static readonly GameStarted: GameSocketEventName<{ state: GameState<string> }> = toEventName('gameStarted');
}