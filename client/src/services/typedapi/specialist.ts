import { createSpecialistRoutes, type MonthlyBans } from "@solaris-common";
import type { Axios } from "axios";
import { doGet, type ResponseResult } from ".";

const routes = createSpecialistRoutes<string>();

export const listBans = (axios: Axios) => async (): Promise<ResponseResult<MonthlyBans>> => {
  return doGet(axios)(routes.listBans, {}, {}, {});
}
