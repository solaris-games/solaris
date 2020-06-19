import axios from 'axios'
import BaseApiService from './base'

class UserService extends BaseApiService {
  
  getMyUserInfo () {
    return axios.get(this.BASE_URL + 'user', { withCredentials: true })
  }

  createUser (email, username, password) {
    return axios.post(this.BASE_URL + 'user', {
      email: email,
      username: username,
      password: password
    })
  }

  toggleEmailNotifications (enabled) {
    return axios.put(this.BASE_URL + 'user/changeEmailPreference', {
      enabled
    },
    { withCredentials: true })
  }

  updateEmailAddress (email) {
    return axios.put(this.BASE_URL + 'user/changeEmailAddress', {
      email
    },
    { withCredentials: true })
  }

  // TODO: Implement UI for this.
  updateUsername (username) {
    return axios.put(this.BASE_URL + 'user/changeUsername', {
      username
    },
    { withCredentials: true })
  }

  updatePassword (currentPassword, newPassword) {
    return axios.put(this.BASE_URL + 'user/changePassword', {
      currentPassword, newPassword
    },
    { withCredentials: true })
  }

  getLeaderboard () {
    return axios.get(this.BASE_URL + 'user/leaderboard',
    { withCredentials: true })
  }

}

export default new UserService()
