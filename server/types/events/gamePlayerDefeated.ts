import { BaseGameEvent } from "./baseGameEvent";

export default interface GamePlayerDefeatedEvent extends BaseGameEvent {
    playerAlias: string;
    openSlot: boolean;
};
