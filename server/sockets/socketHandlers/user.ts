import {ServerSocketHandler} from "./serverSocketHandler";
import {UserSocketEventNames, UserSocketEventType} from "solaris-common";
import SocketService from "../../services/socket";
import {ServerHandler} from "./serverHandler";
import type { Socket } from "socket.io";

export class UserServerSocketHandler extends ServerSocketHandler<UserSocketEventType> {
    constructor(private socketService: SocketService,
                serverHandler: ServerHandler) {
        super(serverHandler);

        this.on(UserSocketEventNames.UserJoined, async (e: { socket?: Socket }) => {
            if (e.socket == null) {
                return;
            }

            const socket: Socket = e.socket;
            const userId = await this.socketService.getUserId(socket);

            if (!userId) {
                return; // If the user is not logged in, do not join any user room.
            }

            socket.join(userId); // Join the user room to receive user-wide messages.
        });

        this.on(UserSocketEventNames.UserLeft, async (e: { socket?: Socket }) => {
            if (e.socket == null) {
                return;
            }

            const socket: Socket = e.socket;
            const userId = await this.socketService.getUserId(socket);

            if (!userId) {
                return; // If the user is not logged in, do not join any user room.
            }

            socket.leave(userId);
        });
    }
}