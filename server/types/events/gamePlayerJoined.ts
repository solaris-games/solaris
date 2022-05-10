import { BaseGameEvent } from "./baseGameEvent";

export default interface GamePlayerJoinedEvent extends BaseGameEvent {
    playerAlias: string;
}