import { type GameState } from "../../api/types/common/game";
import { makeCastFunc } from "../../utilities/cast";
import { type SocketEventName } from "./socketEventName";

export type GameSocketEventType = { gameSocketEventType: 'gameSocketEventType' };
export type GameSocketEventName<TData> = SocketEventName<GameSocketEventType, TData> & { gameSocketEventName: 'gameSocketEventName' };

const toEventName: <TData>(value: string) => GameSocketEventName<TData> = makeCastFunc();

export default class GameSocketEventNames {
    private constructor() { };

    public static readonly GameStarted: GameSocketEventName<{ state: GameState<string> }> = toEventName('gameStarted');
}