import { type DiplomaticStatus } from "../../api/types/common/diplomacy";
import { makeCastFunc } from "../../utilities/cast";
import {type EventName} from "../../events";

export type DiplomacySocketEventType = { diplomacySocketEventType: 'diplomacySocketEventType' };
export type DiplomacySocketEventName<TData> = EventName<DiplomacySocketEventType, TData> & { diplomacySocketEventName: 'diplomacySocketEventName' };

const toEventName: <TData>(value: string) => DiplomacySocketEventName<TData> = makeCastFunc();

export class DiplomacySocketEventNames {
    private constructor() { };

    public static readonly PlayerDiplomaticStatusChanged: DiplomacySocketEventName<{ diplomaticStatus: DiplomaticStatus<string> }> = toEventName('playerDiplomaticStatusChanged');
}