import { type DiplomaticStatus } from "solaris-common/src/api/types/common/diplomacy";
import { makeCastFunc } from "solaris-common/src/utilities/cast";
import { type SocketEventName } from "./socketEventName";

export type DiplomacySocketEventType = { diplomacySocketEventType: 'diplomacySocketEventType' };
export type DiplomacySocketEventName<TData> = SocketEventName<DiplomacySocketEventType, TData> & { diplomacySocketEventName: 'diplomacySocketEventName' };

const toEventName: <TData>(value: string) => DiplomacySocketEventName<TData> = makeCastFunc();

export default class DiplomacySocketEventNames {
    private constructor() { };

    public static readonly PlayerDiplomaticStatusChanged: DiplomacySocketEventName<{ diplomaticStatus: DiplomaticStatus<string> }> = toEventName('playerDiplomaticStatusChanged');
}