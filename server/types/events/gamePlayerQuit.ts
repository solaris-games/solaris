import { BaseGameEvent } from "./baseGameEvent";

export default interface GamePlayerQuitEvent extends BaseGameEvent {
    playerAlias: string;
};
