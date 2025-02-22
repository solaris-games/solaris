import axios from "axios";

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

export const createHttpClient = () => {
  const client = axios.create();

  client.interceptors.response.use((response) => {
    if (response.data) {
      response.data = convertDates(response.data);
    }
    return response;
  }, (error) => {
    return Promise.reject(error);
  });

  return client
}
