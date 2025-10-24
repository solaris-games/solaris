import axios from "axios";
import { v7 as generateV7Uuid } from 'uuid';

const isISODate = (value: unknown) => {
  return typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?Z$/);
};

export const convertDates = (obj: unknown) => {
  if (Array.isArray(obj)) {
    return obj.map(convertDates);
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertDates(value)])
    );
  } else if (isISODate(obj)) {
    return new Date(obj as string);
  }
  return obj;
};

const isUnsafeMethod = (config) => {
  // Rather than just going for idempotent methods, ie the safe ones and put and delete,
  // We are electing here to NOT trust that put or delete currently behave in an idempotent way on the server...
  return !['get', 'head', 'options', 'trace'].includes(config.method);
};

const buildIdempotencyKey = () => {
  return `${generateV7Uuid()}`;
};

export const createHttpClient = (redirectHome: () => void) => {
  const client = axios.create();

  client.interceptors.response.use((response) => {
    if (response.data) {
      response.data = convertDates(response.data);
    }
    return response;
  }, (error) => {
    return Promise.reject(error);
  });

  client.interceptors.request.use(config => {
      config.headers['Idempotency-Key'] = buildIdempotencyKey();

      return config;
    },
    error => {
      return Promise.reject(error);
    }, { synchronous: true, runWhen: isUnsafeMethod });

  client.interceptors.response.use(
    response => {
      return response
    }, error => {
      console.log(error);
      // If any Unauthorized responses come back, redirect to login page.
      if (error.response?.status === 401) {
        redirectHome();
      }

      return Promise.reject({ ...error })
    })

  return client
}
