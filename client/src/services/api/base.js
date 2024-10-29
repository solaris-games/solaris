import axios from 'axios';
import { v7 as generateV7Uuid } from 'uuid';
import router from '../../router';

class BaseApiService {
  constructor () {
    this.BASE_URL = import.meta.env.VUE_APP_API_HOST + '/api/'

    axios.interceptors.request.use(config => {
      config.headers['Idempotency-Key'] = this.buildIdempotencyKey();

      return config;
    },
    error => {
      return Promise.reject(error);
    }, { synchronous: true, runWhen: this.isUnsafeMethod });

    axios.interceptors.response.use(
      response => {
        return response
      }, error => {
        console.log(error);
        // If any Unauthorized responses come back, redirect to login page.
        if (error.response?.status === 401) {
          router.push({ name: 'home' })
        }

        return Promise.reject({ ...error })
      })
  }

  isUnsafeMethod(config) {
    // Rather than just going for idempotent methods, ie the safe ones and put and delete,
    // We are electing here to NOT trust that put or delete currently behave in an idempotent way on the server...
    return !['get', 'head', 'options', 'trace'].includes(config.method);
  }

  buildIdempotencyKey() {
    return `${generateV7Uuid()}`;
  }
}

export default BaseApiService
