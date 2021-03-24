import axios from 'axios'
import BaseApiService from './base'

class AdminService extends BaseApiService {

  getUsers () {
    return axios.get(this.BASE_URL + 'admin/user', { withCredentials: true })
  }

  setRoleContributor (userId, enabled) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/contributor', {
      enabled
    },
    { withCredentials: true })
  }

  setRoleDeveloper (userId, enabled) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/developer', {
      enabled
    },
    { withCredentials: true })
  }

  setRoleCommunityManager (userId, enabled) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/communityManager', {
      enabled
    },
    { withCredentials: true })
  }

  setCredits (userId, credits) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/credits', {
      credits
    },
    { withCredentials: true })
  }

  ban (userId) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/ban', {},
    { withCredentials: true })
  }

  unban (userId) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/unban', {},
    { withCredentials: true })
  }

  impersonate (userId) {
    return axios.post(this.BASE_URL + 'admin/user/' + userId + '/impersonate', {},
    { withCredentials: true })
  }

  getGames () {
    return axios.get(this.BASE_URL + 'admin/game', { withCredentials: true })
  }

  setGameFeatured (gameId, featured) {
    return axios.patch(this.BASE_URL + 'admin/game/' + gameId + '/featured', {
      featured
    },
    { withCredentials: true })
  }

}

export default new AdminService()
