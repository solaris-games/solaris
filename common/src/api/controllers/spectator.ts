import {DeleteRoute, GetRoute, PutRoute} from "./index";
import {type GameSpectator} from "../types/common/game";

export const createSpectatorRoutes = <ID>() => ({
    listSpectators: new GetRoute<{ gameId: string }, {}, GameSpectator<ID>[] | null>("/api/game/:gameId/spectators"),
    inviteSpectators: new PutRoute<{ gameId: string }, {}, { usernames: string[] }, {}>("/api/game/:gameId/spectators/invite"),
    uninviteSpectator: new PutRoute<{ gameId: string, userId: string }, {}, {}, {}>("/api/game/:gameId/spectators/uninvite/:userId"),
    clearSpectators: new DeleteRoute<{ gameId: string }, {}, {}>("/api/game/:gameId/spectators"),
});