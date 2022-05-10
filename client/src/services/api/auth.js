import axios from 'axios'
import BaseApiService from './base'

class AuthService extends BaseApiService {
  login (email, password) {
    return axios.post(this.BASE_URL + 'auth/login', {
      email: email,
      password: password
    },
    {
      withCredentials: true
    })
  }

  logout () {
    return axios.post(this.BASE_URL + 'auth/logout', {}, { withCredentials: true })
  }

  verify () {
    return axios.post(this.BASE_URL + 'auth/verify', {}, { withCredentials: true })
  }

  clearOauthDiscord () {
    return axios.delete(this.BASE_URL + 'auth/discord', { withCredentials: true })
  }
}

export default new AuthService()
