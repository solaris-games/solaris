import { BaseGameEvent } from "./BaseGameEvent";

export default interface GamePlayerJoinedEvent extends BaseGameEvent {
    playerAlias: string;
}