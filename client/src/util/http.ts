import axios, { AxiosError, type AxiosResponse } from "axios";
import { v7 as generateV7Uuid } from "uuid";
import type { FrontendConfig } from "@solaris/common";
import type { ClientEventBus } from "@/clientEventBus.ts";
import StateEventBusEventNames from "@/eventBusEventNames/state.ts";

const isISODate = (value: unknown) => {
  return (
    typeof value === "string" &&
    value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z$/)
  );
};

export const convertDates = (obj: unknown) => {
  if (Array.isArray(obj)) {
    return obj.map(convertDates);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertDates(value)]),
    );
  } else if (isISODate(obj)) {
    return new Date(obj as string);
  }
  return obj;
};

const isUnsafeMethod = (config) => {
  // Rather than just going for idempotent methods, ie the safe ones and put and delete,
  // We are electing here to NOT trust that put or delete currently behave in an idempotent way on the server...
  return !["get", "head", "options", "trace"].includes(config.method);
};

const buildIdempotencyKey = () => {
  return `${generateV7Uuid()}`;
};

export const createHttpClient = (
  config: FrontendConfig,
  eventBus: ClientEventBus,
) => {
  const client = axios.create({
    baseURL: config.appApiHost,
  });

  /*
  Request and response interceptors run in opposite orders

Request interceptors are executed in reverse order (LIFO — last in, first out). The last request interceptor added is executed first.

Response interceptors are executed in the order they were added (FIFO — first in, first out). The first response interceptor added is executed first.
   */

  client.interceptors.request.use(
    (config) => {
      config.headers["Idempotency-Key"] = buildIdempotencyKey();

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
    { synchronous: true, runWhen: isUnsafeMethod },
  );

  const dateResponseHandler = (response: AxiosResponse) => {
    if (response.data) {
      response.data = convertDates(response.data);
    }
    return response;
  };

  const errorHandler = (error: AxiosError) => {
    if (error.response?.status === 502) {
      eventBus.emit(StateEventBusEventNames.BackendDownErrorReceived, {});
    }

    return Promise.reject(error);
  };

  client.interceptors.response.use(dateResponseHandler, errorHandler);

  return client;
};
