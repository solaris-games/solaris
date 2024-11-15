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

  getCurrentFlux () {
    return axios.get(this.BASE_URL + 'game/flux',
      { withCredentials: true })
  }

  createGame (settings) {
    return axios.post(this.BASE_URL + 'game', settings,
      { withCredentials: true })
  }

  createTutorialGame (tutorialKey = null) {
    let path = 'game/tutorial'
    if (tutorialKey)
      path += '/' + tutorialKey
    return axios.post(this.BASE_URL + path, null,
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

  listJoinGamesSummary () {
    return axios.get(this.BASE_URL + 'game/list/summary',
      { withCredentials: true })
  }

  listOfficialGames () {
    return axios.get(this.BASE_URL + 'game/list/official',
      { withCredentials: true })
  }

  listCustomGames () {
    return axios.get(this.BASE_URL + 'game/list/custom',
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

  listRecentlyCompletedGames () {
    return axios.get(this.BASE_URL + 'game/list/completed',
      { withCredentials: true })
  }

  listMyCompletedGames () {
    return axios.get(this.BASE_URL + 'game/list/completed/user',
      { withCredentials: true })
  }

  listSpectatingGames () {
    return axios.get(this.BASE_URL + 'game/list/spectating',
      { withCredentials: true })
  }

  listTutorialGames () {
    return axios.get(this.BASE_URL + 'game/tutorial/list',
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

  concedeDefeat (gameId, openSlot) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/concedeDefeat', {
      openSlot
    },
    { withCredentials: true })
  }

  delete (gameId) {
    return axios.delete(this.BASE_URL + 'game/' + gameId,
      { withCredentials: true })
  }

  pause (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/pause', {
      pause: true
    },
    { withCredentials: true })
  }

  resume (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/pause', {
      pause: false
    },
    { withCredentials: true })
  }

  forceStart(gameId) {
    return axios.post(this.BASE_URL + 'game/' + gameId + '/forcestart', {}, { withCredentials: true })
  }

  fastForward(gameId) {
    return axios.post(this.BASE_URL + 'game/' + gameId + '/fastforward', {}, { withCredentials: true })
  }

  kickPlayer(gameId, playerId) {
    return axios.post(this.BASE_URL + 'game/' + gameId + '/kick', {
      playerId
    }, { withCredentials: true })
  }

  confirmReady (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ready', null,
      { withCredentials: true })
  }

  confirmReadyToCycle (gameId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/readytocycle', null,
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
