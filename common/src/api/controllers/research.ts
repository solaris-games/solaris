import { PutRoute } from "./index";
import type {
    ResearchType,
    ResearchTypeNotRandom,
} from "../../types/common/player";

export type ResearchUpdateNowRequest = {
    preference: ResearchTypeNotRandom;
};

export type ResearchUpdateQueueRequest = {
    queue: ResearchType[];
};

export const createResearchRoutes = <ID>() => ({
    updateNow: new PutRoute<{ gameId: ID }, {}, ResearchUpdateNowRequest, void>(
        "/api/game/:gameId/research/now",
    ),
    updateQueue: new PutRoute<
        { gameId: ID },
        {},
        ResearchUpdateQueueRequest,
        void
    >("/api/game/:gameId/research/queue"),
});
