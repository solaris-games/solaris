import axios from 'axios'
import router from '../../router'

class BaseApiService {

    constructor () {
        this.BASE_URL = process.env.VUE_APP_API_HOST + '/api/'
        console.log(this.BASE_URL)
        axios.interceptors.response.use(
            response => {
                return response
            }, error => {
                // If any Unathorized responses come back, redirect to login page.
                if (error.response.status === 401) {
                    this.$toasted.show(`You are not logged in.`, { type: 'error' })

                    router.push({ name: 'account-login' })
                }

                return Promise.reject({ ...error })
            })
    }

}

export default BaseApiService