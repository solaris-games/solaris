import axios from 'axios'
import BaseApiService from './base'

class AuthService extends BaseApiService {
  login (username, password) {
    return axios.post(this.BASE_URL + 'auth/login', {
      username: username,
      password: password
    },
    {
      withCredentials: true
    })
  }

  logout () {
    return axios.post(this.BASE_URL + 'auth/logout', {}, { withCredentials: true })
  }
  
}

export default new AuthService()
