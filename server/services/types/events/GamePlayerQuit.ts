import { BaseGameEvent } from "./BaseGameEvent";

export default interface GamePlayerQuitEvent extends BaseGameEvent {
    playerAlias: string;
};
