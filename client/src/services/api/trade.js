import axios from 'axios'
import BaseApiService from './base'

class TradeService extends BaseApiService {
  sendCredits (gameId, toPlayerId, amount) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/trade/credits', {
      toPlayerId,
      amount
    },
    { withCredentials: true })
  }

  sendCreditsSpecialists (gameId, toPlayerId, amount) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/trade/creditsSpecialists', {
      toPlayerId,
      amount
    },
    { withCredentials: true })
  }

  sendRenown (gameId, toPlayerId, amount = 1) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/trade/renown', {
      toPlayerId,
      amount
    },
    { withCredentials: true })
  }

  sendTechnology (gameId, toPlayerId, technology, level) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/trade/tech', {
      toPlayerId,
      technology,
      level
    },
    { withCredentials: true })
  }

  getTradeableTechnologies (gameId, toPlayerId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/trade/tech/' + toPlayerId,
      { withCredentials: true })
  }

  listTradeEventsBetweenPlayers (gameId, toPlayerId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/trade/' + toPlayerId + '/events',
      { withCredentials: true })
  }
}

export default new TradeService()
