import { BaseGameEvent } from "./baseGameEvent";

export default interface GamePlayerAFKEvent extends BaseGameEvent {
    playerAlias: string;
};
