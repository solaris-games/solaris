import type { Socket } from "socket.io";
import { PlayerSocketEventNames, type PlayerSocketEventType } from 'solaris-common';
import GameService from "../../services/game";
import SocketService from "../../services/socket";
import { objectIdFromString } from "../../services/types/DBObjectId";
import { Game } from "../../services/types/Game";
import { ServerHandler } from "./serverHandler";
import { ServerSocketHandler } from "./serverSocketHandler";

export class PlayerServerSocketHandler extends ServerSocketHandler<PlayerSocketEventType> {
    constructor(private socketService: SocketService,
                private gameService: GameService,
                serverHandler: ServerHandler) {
        super(serverHandler);

        // When the user opens a game, they will be put
        // into that room to receive web sockets scoped to the game room.
        this.on(PlayerSocketEventNames.GameRoomJoined, async (e: { socket?: Socket, gameId: string, playerId?: string }) => {
            if (e.socket == null) {
                return;
            }

            let socket: Socket = e.socket;

            socket.join(e.gameId); // Join the game room to receive game-wide messages.

            if (e.playerId) {
                socket.join(e.playerId);

                let game: Game | null = await this.gameService.getByIdLean(objectIdFromString(e.gameId), {
                    'settings.general.playerOnlineStatus': 1
                });

                if (game?.settings.general.playerOnlineStatus === 'visible') {
                    // Broadcast to all other players that the player joined the room.
                    socket.to(e.gameId).emit(PlayerSocketEventNames.GamePlayerRoomJoined, {
                        playerId: e.playerId
                    });
                }
            }
        });

        this.on(PlayerSocketEventNames.GameRoomLeft, async (e: { socket?: Socket, gameId: string, playerId?: string }) => {
            if (e.socket == null) {
                return;
            }

            let socket: Socket = e.socket;

            const userId = await this.socketService.getUserId(socket);

            if (userId) {
                socket.leave(userId)
            }

            socket.leave(e.gameId)

            if (e.playerId) {
                socket.leave(e.playerId)

                let game: Game | null = await this.gameService.getByIdLean(objectIdFromString(e.gameId), {
                    'settings.general.playerOnlineStatus': 1
                });

                if (game?.settings.general.playerOnlineStatus === 'visible') {
                    // Broadcast to all other players that the player left the room.
                    socket.to(e.gameId).emit(PlayerSocketEventNames.GamePlayerRoomLeft, {
                        playerId: e.playerId
                    });
                }
            }
        });
    }
}
