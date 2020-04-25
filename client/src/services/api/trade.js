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

  sendRenown (gameId, toPlayerId, amount = 1) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/trade/renown', {
      toPlayerId,
      amount
    },
    { withCredentials: true })
  }

  sendTechnology (gameId, toPlayerId, technology) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/trade/tech', {
      toPlayerId,
      technology
    },
    { withCredentials: true })
  }

  getTradeableTechnologies (gameId, toPlayerId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/trade/tech/' + toPlayerId,
    { withCredentials: true })
  }

}

export default new TradeService()
