import {PutRoute} from "./index";
import type {ResearchType, ResearchTypeNotRandom} from "../../types/common/player";

export type ResearchUpdateNowRequest = {
    preference: ResearchTypeNotRandom;
};

export type ResearchUpdateNextRequest = {
    preference: ResearchType;
};

export type ResearchUpdateResponse = {
    ticksEta: number,
    ticksNextEta: number,
}

export const createResearchRoutes = <ID>() => ({
    updateNow: new PutRoute<{ gameId: ID }, {}, ResearchUpdateNowRequest, ResearchUpdateResponse>("/api/game/:gameId/research/now"),
    updateNext: new PutRoute<{ gameId: ID }, {}, ResearchUpdateNextRequest, ResearchUpdateResponse>("/api/game/:gameId/research/next"),
});
