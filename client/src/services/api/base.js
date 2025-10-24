import axios from 'axios';
import router from '../../router';
import {buildIdempotencyKey, isUnsafeMethod} from "@/util/http";

class BaseApiService {
  constructor () {
    this.BASE_URL = import.meta.env.VUE_APP_API_HOST + '/api/'

    axios.interceptors.request.use(config => {
      config.headers['Idempotency-Key'] = buildIdempotencyKey();

      return config;
    },
    error => {
      return Promise.reject(error);
    }, { synchronous: true, runWhen: isUnsafeMethod });

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
}

export default BaseApiService
