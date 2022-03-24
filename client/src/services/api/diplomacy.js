import axios from 'axios'
import BaseApiService from './base'

class DiplomacyService extends BaseApiService {

  getDiplomaticStatus (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/diplomacy',
      { withCredentials: true })
  }

  getDiplomaticStatusToPlayer (gameId, toPlayerId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/diplomacy/' + toPlayerId,
      { withCredentials: true })
  }
  
  declareAlly (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/diplomacy/ally/' + playerId, {},
      { withCredentials: true })
  }

  declareEnemy (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/diplomacy/enemy/' + playerId, {},
      { withCredentials: true })
  }

  declareNeutral (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/diplomacy/neutral/' + playerId, {},
      { withCredentials: true })
  }

}

export default new DiplomacyService()
