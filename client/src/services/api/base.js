import axios from 'axios'
import router from '../../router'

class BaseApiService {

    // TODO: Needs to be in an env config setting.
    BASE_URL = 'http://localhost:3000/api/'

    constructor () {
        axios.interceptors.response.use(
            response => {
                return response
            }, error => {
                // If any Unathorized responses come back, redirect to login page.
                if (error.response.status === 401) {
                    router.push({ name: 'account-login' })
                }

                return Promise.reject({ ...error })
            })
    }
}

export default BaseApiService