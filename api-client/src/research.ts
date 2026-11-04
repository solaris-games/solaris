import {
    createResearchRoutes,
    type ResearchType,
    type ResearchTypeNotRandom,
} from "@solaris/common";
import { doPut, type ResponseResult } from "./index";
import type { Axios } from "axios";

const routes = createResearchRoutes<string>();

export const updateResearchNow =
    (axios: Axios) =>
    async (
        gameId: string,
        research: ResearchTypeNotRandom,
    ): Promise<ResponseResult<void>> => {
        return doPut(axios)(
            routes.updateNow,
            { gameId },
            {},
            { preference: research },
            { withCredentials: true },
        );
    };

export const updateResearchQueue =
    (axios: Axios) =>
    async (
        gameId: string,
        queue: ResearchType[],
    ): Promise<ResponseResult<void>> => {
        return doPut(axios)(
            routes.updateQueue,
            { gameId },
            {},
            { queue },
            { withCredentials: true },
        );
    };
