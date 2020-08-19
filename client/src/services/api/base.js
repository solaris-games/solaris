import axios from 'axios'
import router from '../../router'

class BaseApiService {
  constructor () {
    this.BASE_URL = process.env.VUE_APP_API_HOST + '/api/'

    axios.interceptors.response.use(
      response => {
        return response
      }, error => {
        // If any Unathorized responses come back, redirect to login page.
        if (error.response.status === 401) {
          router.push({ name: 'home' })
        }

        return Promise.reject({ ...error })
      })
  }
}

export default BaseApiService
