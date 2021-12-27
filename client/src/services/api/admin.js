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

  setRoleGameMaster (userId, enabled) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/gameMaster', {
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

  resetAchievements (userId) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/resetachievements', {},
    { withCredentials: true })
  }

  promoteToEstablishedPlayer (userId) {
    return axios.patch(this.BASE_URL + 'admin/user/' + userId + '/promoteToEstablishedPlayer', {},
    { withCredentials: true })
  }

  impersonate (userId, username, roles) {
    return axios.post(this.BASE_URL + 'admin/user/' + userId + '/impersonate', {
      username,
      roles
    },
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

  setGameTimeMachine (gameId, timeMachine) {
    return axios.patch(this.BASE_URL + 'admin/game/' + gameId + '/timeMachine', {
      timeMachine
    },
    { withCredentials: true })
  }

}

export default new AdminService()
