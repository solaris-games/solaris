import axios from 'axios'

class ApiService {
  login (username, password) {
    return axios.post('http://localhost:3000/api/auth/login', {
      username: username,
      password: password
    },
    {
      withCredentials: true
    })
  }

  logout () {
    return axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true })
  }

  getMyUserInfo () {
    return axios.get('http://localhost:3000/api/user', { withCredentials: true })
  }

  getUserInfo (userId) {
    return axios.get('http://localhost:3000/api/user/' + userId, { withCredentials: true })
  }

  createUser (username, email, password) {
    return axios.post('http://localhost:3000/api/user', {
      username: username,
      email: email,
      password: password
    })
  }

  toggleEmailNotifications (enabled) {
    return axios.post('http://localhost:3000/api/user/changeEmailPreference', {
      enabled
    },
    { withCredentials: true })
  }

  updateEmailAddress (email) {
    return axios.post('http://localhost:3000/api/user/changeEmailAddress', {
      email
    },
    { withCredentials: true })
  }

  updatePassword (currentPassword, newPassword) {
    return axios.post('http://localhost:3000/api/user/changePassword', {
      currentPassword, newPassword
    },
    { withCredentials: true })
  }

  getDefaultGameSettings () {
    return axios.get('http://localhost:3000/api/game/defaultSettings',
      { withCredentials: true })
  }

  createGame (settings) {
    return axios.post('http://localhost:3000/api/game', settings,
      { withCredentials: true })
  }

  getGameInfo (id) {
    return axios.get('http://localhost:3000/api/game/' + id + '/info',
      { withCredentials: true })
  }

  getGameGalaxy (id) {
    return axios.get('http://localhost:3000/api/game/' + id + '/galaxy',
      { withCredentials: true })
  }

  listOfficialGames () {
    return axios.get('http://localhost:3000/api/game/list/official',
      { withCredentials: true })
  }

  listUserGames () {
    return axios.get('http://localhost:3000/api/game/list/user',
      { withCredentials: true })
  }

  listActiveGames () {
    return axios.get('http://localhost:3000/api/game/list/active',
      { withCredentials: true })
  }

  listCompletedGames () {
    return axios.get('http://localhost:3000/api/game/list/completed',
      { withCredentials: true })
  }

  joinGame (gameId, playerId, alias) {
    return axios.post('http://localhost:3000/api/game/' + gameId + '/join', {
      playerId, alias
    },
    { withCredentials: true })
  }

  concedeDefeat (gameId) {
    return axios.post('http://localhost:3000/api/game/' + gameId + '/concedeDefeat', null,
      { withCredentials: true })
  }

  updateResearchNow (gameId, preference) {
    return axios.post('http://localhost:3000/api/player/' + gameId + '/research/now', {
      preference
    },
    { withCredentials: true })
  }

  updateResearchNext (gameId, preference) {
    return axios.post('http://localhost:3000/api/player/' + gameId + '/research/next', {
      preference
    },
    { withCredentials: true })
  }

  sendCredits (gameId, toPlayerId, amount) {
    return axios.post('http://localhost:3000/api/game/' + gameId + '/send/credits', {
      toPlayerId,
      amount
    },
    { withCredentials: true })
  }

}

export default new ApiService()
