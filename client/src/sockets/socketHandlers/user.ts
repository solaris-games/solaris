import {ClientSocketHandler} from "./clientSocketHandler";
import type {ConversationMessageSentResult, UserSocketEventType} from "@solaris-common";
import type {State} from "../../store";
import type {EventBus} from "../../eventBus";
import type { Store } from "vuex/types/index.js";
import type { Socket } from "socket.io-client";
import {UserSocketEventNames} from "@solaris-common";
import UserEventBusEventNames from "../../eventBusEventNames/user";

export class UserClientSocketHandler extends ClientSocketHandler<UserSocketEventType> {
  constructor(socket: Socket,
              store: Store<State>,
              eventBus: EventBus) {
    super(socket);

    this.on(UserSocketEventNames.GameMessageSent, (e: ConversationMessageSentResult<string>) => {
      console.log("Received game message sent event", e);
      eventBus.emit(UserEventBusEventNames.GameMessageSent, e)
    });
  }
}
