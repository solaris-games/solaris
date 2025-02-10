import { createAdminRoutes } from "@solaris-common";
import type { Axios } from "axios";
import { doGet } from ".";

const routes = createAdminRoutes<string>();

export const getUsers = (axios: Axios) => async () => {
  return doGet(axios)(routes.listUsers, {});
}

export const getPasswordResets = (axios: Axios) => async () => {
  return doGet(axios)(routes.listPasswordResets, {});
}
