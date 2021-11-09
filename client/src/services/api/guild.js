import axios from 'axios'
import BaseApiService from './base'

class GuildService extends BaseApiService {
  list () {
    return axios.get(this.BASE_URL + 'guild/list', { withCredentials: true })
  }

  getLeaderboard (limit, sortingKey) {
    return axios.get(this.BASE_URL + 'guild/leaderboard', 
      {
        withCredentials: true,
        params: {
          limit,
          sortingKey
        }
      })
  }

  listInvitations () {
    return axios.get(this.BASE_URL + 'guild/invites', { withCredentials: true })
  }

  listApplications () {
    return axios.get(this.BASE_URL + 'guild/applications', { withCredentials: true })
  }

  details (guildId) {
    return axios.get(this.BASE_URL + 'guild/' + guildId, {
      withCredentials: true
    });
  }

  detailMyGuild () {
    return axios.get(this.BASE_URL + 'guild', { withCredentials: true })
  }

  create (name, tag) {
    return axios.post(this.BASE_URL + 'guild', {
      name,
      tag
    }, { withCredentials: true })
  }

  rename (name, tag) {
    return axios.patch(this.BASE_URL + 'guild', {
      name,
      tag
    }, { withCredentials: true })
  }

  delete (guildId) {
    return axios.delete(this.BASE_URL + 'guild/' + guildId, { withCredentials: true })
  }

  invite (guildId, username) {
    return axios.put(this.BASE_URL + 'guild/' + guildId + '/invite', 
      {
        username
      }, 
      { withCredentials: true })
  }

  uninvite (guildId, userId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/uninvite/' + userId, 
      {}, 
      { withCredentials: true })
  }

  accept (guildId, userId = null) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/accept/' + (userId || ''), 
      {}, 
      { withCredentials: true })
  }

  withdraw (guildId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/withdraw', 
      {}, 
      { withCredentials: true })
  }

  decline (guildId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/decline', 
      {}, 
      { withCredentials: true })
  }

  apply (guildId) {
    return axios.put(this.BASE_URL + 'guild/' + guildId + '/apply', 
      {}, 
      { withCredentials: true })
  }

  withdraw (guildId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/withdraw', 
      {}, 
      { withCredentials: true })
  }

  reject (guildId, userId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/reject/' + userId, 
      {}, 
      { withCredentials: true })
  }

  leave (guildId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/leave', 
      {}, 
      { withCredentials: true })
  }

  promote (guildId, userId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/promote/' + userId, 
      {}, 
      { withCredentials: true })
  }

  demote (guildId, userId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/demote/' + userId, 
      {}, 
      { withCredentials: true })
  }

  kick (guildId, userId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/kick/' + userId, 
      {}, 
      { withCredentials: true })
  }
}

export default new GuildService()
