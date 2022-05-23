import { BaseGameEvent } from "./BaseGameEvent";

export default interface GamePlayerDefeatedEvent extends BaseGameEvent {
    playerAlias: string;
    openSlot: boolean;
};
