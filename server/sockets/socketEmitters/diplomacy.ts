import { Server } from "socket.io";
import { DiplomaticStatus } from "solaris-common";
import { DiplomacySocketEventNames, DiplomacySocketEventType } from "solaris-common";
import { ServerSocketEmitter } from "./serverSocketEmitter";

export class DiplomacyServerSocketEmitter extends ServerSocketEmitter<DiplomacySocketEventType> {
    constructor(server: Server) {
        super(server);
    }

    public emitPlayerDiplomaticStatusChanged(room: string | string[], data: { diplomaticStatus: DiplomaticStatus<string> }) {
        this.emit(room, DiplomacySocketEventNames.PlayerDiplomaticStatusChanged, data);
    }
}
