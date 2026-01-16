import {doGet, doPut, type ResponseResult} from "@/services/typedapi/index";
import { type Axios } from "axios";
import {
  createTradeRoutes,
  type ReputationResponse,
  type ResearchTypeNotRandom, type TradeEvent,
  type TradeTechnology
} from "@solaris-common";

type PRR<A> = Promise<ResponseResult<A>>;

const routes = createTradeRoutes<string>();

export const sendCredits = (axios: Axios) => async (gameId: string, toPlayerId: string, amount: number): PRR<ReputationResponse<string>> => {
  return doPut(axios)(routes.sendCredits, { gameId }, {}, { toPlayerId, amount }, { withCredentials: true });
};

export const sendCreditsSpecialists = (axios: Axios) => async (gameId: string, toPlayerId: string, amount: number): PRR<ReputationResponse<string>> => {
  return doPut(axios)(routes.sendCreditsSpecialists, { gameId }, {}, { toPlayerId, amount }, { withCredentials: true });
};

export const sendRenown = (axios: Axios) => async (gameId: string, toPlayerId: string, amount: number): PRR<{}> => {
  return doPut(axios)(routes.sendRenown, { gameId }, {}, { toPlayerId, amount }, { withCredentials: true });
};

export const sendTechnology = (axios: Axios) => async (gameId: string, toPlayerId: string, technology: ResearchTypeNotRandom, level: number): PRR<ReputationResponse<string>> => {
  return doPut(axios)(routes.sendTechnology, { gameId }, {}, { toPlayerId, technology, level }, { withCredentials: true });
};

export const listTradeableTechnologies = (axios: Axios) => async (gameId: string, toPlayerId: string): PRR<TradeTechnology[]> => {
  return doGet(axios)(routes.listTradeableTechnologies, { gameId, toPlayerId }, {}, { withCredentials: true });
};

export const listTradeEvents = (axios: Axios) => async (gameId: string, toPlayerId: string): PRR<TradeEvent<string>[]> => {
  return doGet(axios)(routes.listTradeEvents, { gameId, toPlayerId }, {}, { withCredentials: true });
};
