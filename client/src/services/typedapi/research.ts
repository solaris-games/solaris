import {
  createResearchRoutes,
  type ResearchType,
  type ResearchTypeNotRandom,
} from "@solaris/common";
import { doPut, type ResponseResult } from "@/services/typedapi/index";
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

export const updateResearchNext =
  (axios: Axios) =>
  async (
    gameId: string,
    research: ResearchType,
  ): Promise<ResponseResult<void>> => {
    return doPut(axios)(
      routes.updateNext,
      { gameId },
      {},
      { preference: research },
      { withCredentials: true },
    );
  };
