import { DiplomacySocketEventNames, DiplomacySocketEventType, DiplomaticStatus } from "@solaris-common";
import { Server } from "socket.io";
import { ServerSocketEmitter } from "./serverSocketEmitter";

export class DiplomacyServerSocketEmitter extends ServerSocketEmitter<DiplomacySocketEventType> {
    constructor(server: Server) {
        super(server);
    }

    public emitPlayerDiplomaticStatusChanged(room: string | string[], data: { diplomaticStatus: DiplomaticStatus<string> }) {
        this.emit(room, DiplomacySocketEventNames.PlayerDiplomaticStatusChanged, data);
    }
}
