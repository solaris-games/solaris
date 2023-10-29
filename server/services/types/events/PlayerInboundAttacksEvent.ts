
import { InboundAttacks } from "../../inboundAttacks";
import { BaseGameEvent } from "./BaseGameEvent";

export default interface PlayerInboundAttacksEvent extends BaseGameEvent {
    inboundAttacks: InboundAttacks
};
