
import { DBObjectId } from "../DBObjectId";
import { Specialist } from "../Specialist";
import { BaseGameEvent } from "./BaseGameEvent";

export interface PlayerInboundAttacksEvent extends BaseGameEvent {
    attacks: {
        playerId: DBObjectId,
        starId: DBObjectId,
        attackingPlayerId: DBObjectId,
        carrierId: DBObjectId,
        ships: number | null,
        specialist?: Specialist
    }[]
}