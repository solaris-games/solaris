import axios from 'axios'
import BaseApiService from './base'

class UserService extends BaseApiService {
  getMyUserInfo () {
    return axios.get(this.BASE_URL + 'user', { withCredentials: true })
  }

  getUserAchievements (userId) {
    return axios.get(this.BASE_URL + 'user/achievements/' + userId, { withCredentials: true })
  }

  getGameSettings () {
    return axios.get(this.BASE_URL + 'user/settings', { withCredentials: true })
  }

  saveGameSettings (settings) {
    return axios.put(this.BASE_URL + 'user/settings', settings, { withCredentials: true })
  }

  createUser (email, username, password, recaptchaToken) {
    return axios.post(this.BASE_URL + 'user', {
      email: email,
      username: username,
      password: password,
      recaptchaToken: recaptchaToken
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

  requestResetPassword (email) {
    return axios.post(this.BASE_URL + 'user/requestResetPassword', {
      email
    })
  }

  resetPassword (token, newPassword) {
    return axios.post(this.BASE_URL + 'user/resetPassword', {
      token, newPassword
    })
  }

  requestUsername (email) {
    return axios.post(this.BASE_URL + 'user/requestUsername', {
      email
    })
  }

  getLeaderboard (limit, sortingKey, skip) {
    return axios.get(this.BASE_URL + 'user/leaderboard',
      {
        withCredentials: true,
        params: {
          limit,
          sortingKey,
          skip
        }
      })
  }

  closeAccount () {
    return axios.delete(this.BASE_URL + 'user/closeAccount',
    { withCredentials: true })
  }
}

export default new UserService()
