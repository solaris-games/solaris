import {ClientSocketHandler} from "./clientSocketHandler";
import type {ConversationMessageSentResult, UserSocketEventType} from "@solaris/common";
import type {EventBus} from "../../eventBus";
import type { Socket } from "socket.io-client";
import {UserSocketEventNames} from "@solaris/common";
import UserEventBusEventNames from "../../eventBusEventNames/user";

export class UserClientSocketHandler extends ClientSocketHandler<UserSocketEventType> {
  constructor(socket: Socket,
              eventBus: EventBus) {
    super(socket);

    this.on(UserSocketEventNames.GameMessageSent, (e: ConversationMessageSentResult<string>) => {
      eventBus.emit(UserEventBusEventNames.GameMessageSent, e)
    });
  }
}
