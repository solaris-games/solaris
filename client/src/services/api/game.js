import axios from 'axios'
import BaseApiService from './base'

class GameService extends BaseApiService {
  getPlayerUserInfo (gameId, playerId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/player/' + playerId, { withCredentials: true })
  }

  getDefaultGameSettings () {
    return axios.get(this.BASE_URL + 'game/defaultSettings',
      { withCredentials: true })
  }

  createGame (settings) {
    return axios.post(this.BASE_URL + 'game', settings,
      { withCredentials: true })
  }

  getGameInfo (id) {
    return axios.get(this.BASE_URL + 'game/' + id + '/info',
      { withCredentials: true })
  }

  getGameHistory (id) {
    return axios.get(this.BASE_URL + 'game/' + id + '/history',
      { withCredentials: true })
  }

  getGameGalaxy (id) {
    return axios.get(this.BASE_URL + 'game/' + id + '/galaxy',
      { withCredentials: true })
  }

  listOfficialGames () {
    return axios.get(this.BASE_URL + 'game/list/official',
      { withCredentials: true })
  }

  listUserGames () {
    return axios.get(this.BASE_URL + 'game/list/user',
      { withCredentials: true })
  }

  listActiveGames () {
    return axios.get(this.BASE_URL + 'game/list/active',
      { withCredentials: true })
  }

  listCompletedGames () {
    return axios.get(this.BASE_URL + 'game/list/completed',
      { withCredentials: true })
  }

  joinGame (gameId, playerId, alias, avatar, password) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/join', {
      playerId, alias, avatar, password
    },
    { withCredentials: true })
  }

  quitGame (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/quit', null,
      { withCredentials: true })
  }

  concedeDefeat (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/concedeDefeat', null,
      { withCredentials: true })
  }

  delete (gameId) {
    return axios.delete(this.BASE_URL + 'game/' + gameId,
      { withCredentials: true })
  }

  getEvents (gameId, startTick = 0) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/events?startTick=' + startTick.toString(),
      { withCredentials: true })
  }

  confirmReady (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ready', null,
      { withCredentials: true })
  }

  unconfirmReady (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/notready', null,
      { withCredentials: true })
  }
}

export default new GameService()
