import {
  createResearchRoutes,
  type ResearchType,
  type ResearchTypeNotRandom,
  type ResearchUpdateResponse
} from "@solaris-common";
import {doPut, type ResponseResult} from "@/services/typedapi/index";
import type { Axios } from "axios";

const routes = createResearchRoutes<string>();

export const updateResearchNow = (axios: Axios) => async (gameId: string, research: ResearchTypeNotRandom): Promise<ResponseResult<ResearchUpdateResponse>> => {
  return doPut(axios)(routes.updateNow, { gameId }, {}, { preference: research }, { withCredentials: true });
};

export const updateResearchNext = (axios: Axios) => async (gameId: string, research: ResearchType): Promise<ResponseResult<ResearchUpdateResponse>> => {
  return doPut(axios)(routes.updateNext, { gameId }, {}, { preference: research }, { withCredentials: true });
};
