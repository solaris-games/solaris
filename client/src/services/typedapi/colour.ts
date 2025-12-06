import {createColourRoutes, type PlayerColour} from "@solaris-common";
import {doGet, doPut, type ResponseResult} from "@/services/typedapi/index";
import { type Axios } from "axios";

const routes = createColourRoutes();

export const listColours = (axios: Axios) => async (): Promise<ResponseResult<PlayerColour[]>> => {
  return doGet(axios)(routes.listColours, {}, {});
}

export const addColour = (axios: Axios) => async (gameId: string, playerId: string, colour: PlayerColour): Promise<ResponseResult<{}>> => {
  return doPut(axios)(routes.addColour, { gameId }, {}, {
    playerId,
    colour,
  });
}
