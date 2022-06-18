import { BaseGameEvent } from "./BaseGameEvent";

export default interface GamePlayerAFKEvent extends BaseGameEvent {
    playerAlias: string;
};
