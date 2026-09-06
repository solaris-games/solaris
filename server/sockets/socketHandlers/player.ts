import type { Socket } from "socket.io";
import {
    PlayerSocketEventNames,
    type PlayerSocketEventType,
} from "@solaris/common";
import GameService from "../../services/game";
import SocketService from "../../services/socket";
import { objectIdFromString } from "../../services/types/DBObjectId";
import { Game } from "../../services/types/Game";
import { ServerHandler } from "./serverHandler";
import { ServerSocketHandler } from "./serverSocketHandler";
import PlayerService from "../../services/player";

export class PlayerServerSocketHandler extends ServerSocketHandler<PlayerSocketEventType> {
    constructor(
        private socketService: SocketService,
        private gameService: GameService,
        private playerService: PlayerService,
        serverHandler: ServerHandler,
    ) {
        super(serverHandler);

        // When the user opens a game, they will be put
        // into that room to receive web sockets scoped to the game room.
        this.on(
            PlayerSocketEventNames.GameRoomJoined,
            async (e: {
                socket?: Socket;
                gameId: string;
                playerId?: string;
            }) => {
                if (e.socket == null) {
                    return;
                }

                const socket: Socket = e.socket;

                const game: Game | null = await this.gameService.getByIdLean(
                    objectIdFromString(e.gameId),
                    {
                        "settings.general.playerOnlineStatus": 1,
                        "galaxy.players._id": 1,
                        "galaxy.players.userId": 1,
                    },
                );

                if (!game) {
                    return;
                }

                socket.join(e.gameId); // Join the game room to receive game-wide messages.

                if (e.playerId) {
                    // Only allow the socket to join the player room if the
                    // logged in user actually controls that player, otherwise
                    // anyone could subscribe to another player's private events.
                    const userId = await this.socketService.getUserId(socket);

                    if (!userId) {
                        return;
                    }

                    const player = this.playerService.getByUserId(
                        game,
                        objectIdFromString(userId),
                    );

                    if (!player || player.userId?.toString() !== userId) {
                        return;
                    }

                    socket.join(e.playerId);

                    if (
                        game?.settings.general.playerOnlineStatus === "visible"
                    ) {
                        // Broadcast to all other players that the player joined the room.
                        socket
                            .to(e.gameId)
                            .emit(PlayerSocketEventNames.GamePlayerRoomJoined, {
                                playerId: e.playerId,
                            });
                    }
                }
            },
        );

        this.on(
            PlayerSocketEventNames.GameRoomLeft,
            async (e: {
                socket?: Socket;
                gameId: string;
                playerId?: string;
            }) => {
                if (e.socket == null) {
                    return;
                }

                const socket: Socket = e.socket;

                socket.leave(e.gameId);

                if (e.playerId) {
                    socket.leave(e.playerId);

                    const game: Game | null =
                        await this.gameService.getByIdLean(
                            objectIdFromString(e.gameId),
                            {
                                "settings.general.playerOnlineStatus": 1,
                            },
                        );

                    if (
                        game?.settings.general.playerOnlineStatus === "visible"
                    ) {
                        // Broadcast to all other players that the player left the room.
                        socket
                            .to(e.gameId)
                            .emit(PlayerSocketEventNames.GamePlayerRoomLeft, {
                                playerId: e.playerId,
                            });
                    }
                }
            },
        );
    }
}
