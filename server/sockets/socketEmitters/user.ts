import {ServerSocketEmitter} from "./serverSocketEmitter";
import {
    ConversationMessageSentResult,
    UserSocketEventNames,
    UserSocketEventType
} from "solaris-common";

export class UserServerSocketEmitter extends ServerSocketEmitter<UserSocketEventType> {
    public emitGameMessageSent(room: string | string[], data: ConversationMessageSentResult<string>) {
        this.emit(room, UserSocketEventNames.GameMessageSent, data);
    }
}