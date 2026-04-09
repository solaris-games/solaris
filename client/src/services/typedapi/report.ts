import {createReportRoutes} from "@solaris/common";
import { type Axios } from "axios";
import {doPost, type ResponseResult} from "@/services/typedapi/index";

const routes = createReportRoutes<string>();

export const createReport = (axios: Axios) => async (gameId: string, playerId: string, messageId: string | undefined, conversationId: string | undefined, abuse: boolean, spamming: boolean, multiboxing: boolean, inappropriateAlias: boolean): Promise<ResponseResult<{}>> => {
  const conversation = (conversationId && messageId) ? {
    conversationId,
    messageId,
  } : undefined;
  return doPost(axios)(routes.createReport, { gameId }, {}, {
    playerId,
    reasons: {
      abuse,
      spamming,
      multiboxing,
      inappropriateAlias,
    },
    conversation,
  }, { withCredentials: true });
};
