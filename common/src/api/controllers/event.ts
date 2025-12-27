import {GetRoute, PatchRoute} from "./index";
import type {BaseGameEvent} from "../../types/common/events/game";

export type ListEventsResponse<ID> = {
    count: number,
    events: BaseGameEvent<ID>[],
}

export const createEventRoutes = <ID>() => ({
    listEvents: new GetRoute<{ gameId: ID }, {}, ListEventsResponse<ID>>("/api/game/:gameId/events"),
    markAllAsRead: new PatchRoute<{ gameId: ID }, {}, {}, {}>("/api/game/:gameId/events/markAsRead"),
    markAsRead: new PatchRoute<{ gameId: ID, eventId: ID }, {}, {}, {}>("/api/game/:gameId/events/:eventId/markAsRead"),
    unreadCount: new GetRoute<{ gameId: ID }, {}, { unread: number }>("/api/game/:gameId/events/unread"),
});
