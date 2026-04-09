import {createLedgerRoutes, type LedgerModificationResponse, type PlayerLedgerDebt} from "@solaris/common";
import {doGet, doPut, type ResponseResult} from "@/services/typedapi/index";
import type { Axios } from "axios";

const routes = createLedgerRoutes<string>();

type PRR<A> = Promise<ResponseResult<A>>;

export const detailLedgerCredits = (axios: Axios) => async (gameId: string): PRR<PlayerLedgerDebt<string>[]> => {
  return doGet(axios)(routes.detailLedgerCredits, { gameId }, {}, { withCredentials: true });
}

export const forgiveLedgerCredits = (axios: Axios) => async (gameId: string, playerId: string): PRR<LedgerModificationResponse<string>> => {
  return doPut(axios)(routes.forgiveLedgerCredits, { gameId, playerId }, {}, {}, { withCredentials: true });
}

export const settleLedgerCredits = (axios: Axios) => async (gameId: string, playerId: string): PRR<LedgerModificationResponse<string>> => {
  return doPut(axios)(routes.settleLedgerCredits, { gameId, playerId }, {}, {}, { withCredentials: true });
}

export const detailLedgerSpecialistTokens = (axios: Axios) => async (gameId: string): PRR<PlayerLedgerDebt<string>[]> => {
  return doGet(axios)(routes.detailLedgerSpecialistTokens, { gameId }, {}, { withCredentials: true });
}

export const forgiveLedgerSpecialistTokens = (axios: Axios) => async (gameId: string, playerId: string): PRR<LedgerModificationResponse<string>> => {
  return doPut(axios)(routes.forgiveLedgerSpecialistTokens, { gameId, playerId }, {}, {}, { withCredentials: true });
}

export const settleLedgerSpecialistTokens = (axios: Axios) => async (gameId: string, playerId: string): PRR<LedgerModificationResponse<string>> => {
  return doPut(axios)(routes.settleLedgerSpecialistTokens, { gameId, playerId }, {}, {}, { withCredentials: true });
}
