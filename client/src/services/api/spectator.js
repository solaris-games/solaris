import axios from 'axios'
import BaseApiService from './base'

class SpectatorService extends BaseApiService {
  list (gameId) {
    return axios.get(`${this.BASE_URL}game/${gameId}/spectators`,
    { withCredentials: true })
  }

  invite (gameId, username) {
    return axios.put(`${this.BASE_URL}game/${gameId}/spectators/invite`, {
      username
    },
    { withCredentials: true })
  }

  uninvite (gameId, userId) {
    return axios.put(`${this.BASE_URL}game/${gameId}/spectators/uninvite/${userId}`, {},
    { withCredentials: true })
  }

  clear (gameId, userId) {
    return axios.delete(`${this.BASE_URL}game/${gameId}/spectators`, {},
    { withCredentials: true })
  }
}

export default new SpectatorService()
