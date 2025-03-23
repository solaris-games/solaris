import type {SocketEventName} from "./socketEventName";
import {makeCastFunc} from "../../utilities/cast";
import type {ConversationMessageSentResult} from "../../api/types/common/conversationMessage";

export type UserSocketEventType = { UserSocketEventType: 'userSocketEventType' };
export type UserSocketEventName<TData> = SocketEventName<UserSocketEventType, TData> & { userSocketEventName: 'userSocketEventName' }

const toEventName: <TData>(value: string) => UserSocketEventName<TData> = makeCastFunc();

export class UserSocketEventNames {
    public static readonly GameMessageSent: UserSocketEventName<ConversationMessageSentResult<string>> = toEventName('gameMessageSent');
}