import { Server } from "socket.io";
import { DiplomaticStatus } from "solaris-common/src/api/types/common/diplomacy";
import DiplomacySocketEventNames, { DiplomacySocketEventType } from "solaris-common/src/sockets/socketEventNames/diplomacy";
import { ServerSocketEmitter } from "./serverSocketEmitter";

export class DiplomacyServerSocketEmitter extends ServerSocketEmitter<DiplomacySocketEventType> {
    constructor(server: Server) {
        super(server);
    }

    public emitPlayerDiplomaticStatusChanged(room: string | string[], data: { diplomaticStatus: DiplomaticStatus<string> }) {
        this.emit(room, DiplomacySocketEventNames.PlayerDiplomaticStatusChanged, data);
    }
}
