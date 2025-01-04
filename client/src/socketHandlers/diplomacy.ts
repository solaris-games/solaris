import type { Socket } from "socket.io-client";
import DiplomacySocketEventNames, { type DiplomacySocketEventType } from 'solaris-common/src/sockets/socketEventNames/diplomacy';
import type { DiplomaticStatus } from "../../../common/src/api/types/common/diplomacy";
import type { EventBus } from "../eventBus";
import DiplomacyEventBusEventNames from "../eventBusEventNames/diplomacy";
import { ClientSocketHandler } from "./clientSocketHandler";

export class DiplomacyClientSocketHandler extends ClientSocketHandler<DiplomacySocketEventType> {
  constructor(socket: Socket,
              eventBus: EventBus) {
    super(socket);

    this.on(DiplomacySocketEventNames.PlayerDiplomaticStatusChanged, (e: { diplomaticStatus: DiplomaticStatus<string> }) => eventBus.emit(DiplomacyEventBusEventNames.PlayerDiplomaticStatusChanged, e));
  }
}
