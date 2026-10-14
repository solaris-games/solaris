import { PutRoute } from "./index";
import type {
    ResearchType,
    ResearchTypeNotRandom,
} from "../../types/common/player";

export type ResearchUpdateNowRequest = {
    preference: ResearchTypeNotRandom;
};

export type ResearchUpdateNextRequest = {
    preference: ResearchType;
};

export const createResearchRoutes = <ID>() => ({
    updateNow: new PutRoute<{ gameId: ID }, {}, ResearchUpdateNowRequest, void>(
        "/api/game/:gameId/research/now",
    ),
    updateNext: new PutRoute<
        { gameId: ID },
        {},
        ResearchUpdateNextRequest,
        void
    >("/api/game/:gameId/research/next"),
});
