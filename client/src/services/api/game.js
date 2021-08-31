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

  getGameState (id) {
    return axios.get(this.BASE_URL + 'game/' + id + '/state',
      { withCredentials: true })
  }

  getGameIntel (id, startTick, endTick) {
    let url = `${this.BASE_URL}game/${id}/intel?startTick=${startTick.toString()}&endTick=${endTick.toString()}`

    return axios.get(url, { withCredentials: true })
  }

  getGameGalaxy (id, tick = null) {
    let path = 'game/' + id + '/galaxy'

    if (tick) {
      path += '?tick=' + tick.toString()
    }

    return axios.get(this.BASE_URL + path,
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

  listInProgressGames () {
    return axios.get(this.BASE_URL + 'game/list/inprogress',
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

  confirmReady (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ready', null,
      { withCredentials: true })
  }

  unconfirmReady (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/notready', null,
      { withCredentials: true })
  }

  confirmReadyToQuit (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/readytoquit', null,
      { withCredentials: true })
  }

  unconfirmReadyToQuit (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/notreadytoquit', null,
      { withCredentials: true })
  }

  getGameNotes (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/notes',
      { withCredentials: true })
  }

  updateGameNotes (gameId, notes) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/notes', { notes },
      { withCredentials: true })
  }

  touchPlayer (gameId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/player/touch', {},
      { withCredentials: true })
  }
}

export default new GameService()
