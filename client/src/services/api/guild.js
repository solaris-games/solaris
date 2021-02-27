import axios from 'axios'
import BaseApiService from './base'

class GuildService extends BaseApiService {
  list () {
    return axios.get(this.BASE_URL + 'guild', { withCredentials: true })
  }

  detail (guildId) {
    return axios.get(this.BASE_URL + 'guild/' + guildId, { withCredentials: true })
  }

  create (name, tag) {
    return axios.post(this.BASE_URL + 'guild', {
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

  acceptInvite (guildId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/acceptInvite', 
      {}, 
      { withCredentials: true })
  }

  declineInvite (guildId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/declineInvite', 
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

  kick (guildId, userId) {
    return axios.patch(this.BASE_URL + 'guild/' + guildId + '/kick/' + userId, 
      {}, 
      { withCredentials: true })
  }
}

export default new GuildService()
