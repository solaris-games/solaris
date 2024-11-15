import axios from 'axios'
import BaseApiService from './base'

class AdminService extends BaseApiService {

  getUsers () {
    return axios.get(this.BASE_URL + 'admin/user', { withCredentials: true })
  }

  getPasswordResets () {
    return axios.get(this.BASE_URL + 'admin/passwordresets', { withCredentials: true })
  }

  getReports () {
    return axios.get(this.BASE_URL + 'admin/reports', { withCredentials: true })
  }

  addWarning (userId, text) {
    return axios.post(this.BASE_URL + 'admin/user/' + userId + '/warning', {
      text
    },
    { withCredentials: true })
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

  impersonate (userId) {
    return axios.post(this.BASE_URL + 'admin/user/' + userId + '/impersonate', {},
    { withCredentials: true })
  }

  endImpersonate() {
    return axios.post(this.BASE_URL + 'admin/endImpersonate', {},
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

  forceGameFinish (gameId) {
    return axios.patch(this.BASE_URL + 'admin/game/' + gameId + '/finish', {},
    { withCredentials: true })
  }

  setGameTimeMachine (gameId, timeMachine) {
    return axios.patch(this.BASE_URL + 'admin/game/' + gameId + '/timeMachine', {
      timeMachine
    },
    { withCredentials: true })
  }

  actionReport (reportId) {
    return axios.patch(this.BASE_URL + 'admin/reports/' + reportId + '/action', {},
    { withCredentials: true })
  }

  getInsights () {
    return axios.get(this.BASE_URL + 'admin/insights', { withCredentials: true })
  }

  resetQuitters (gameId) {
    return axios.delete(`${this.BASE_URL}admin/game/${gameId}/quitters`, { withCredentials: true })
  }

  getConversationForReport (reportId) {
    return axios.get(`${this.BASE_URL}admin/reports/${reportId}/conversation`, { withCredentials: true })
  }

  createAnnouncement (announcement) {
    return axios.post(`${this.BASE_URL}admin/announcements/`, announcement, { withCredentials: true })
  }

  deleteAnnouncement (announcementId) {
    return axios.delete(`${this.BASE_URL}admin/announcements/${announcementId}`, { withCredentials: true })
  }

  getAllAnnouncements () {
    return axios.get(`${this.BASE_URL}admin/announcements/`, { withCredentials: true })
  }
}

export default new AdminService()
