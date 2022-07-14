import axios from 'axios'
import BaseApiService from './base'

class LedgerService extends BaseApiService {
  getLedgerCredits (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/ledger/credits',
      { withCredentials: true })
  }
  
  forgiveDebtCredits (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ledger/credits/forgive/' + playerId, {},
      { withCredentials: true })
  }

  settleDebtCredits (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ledger/credits/settle/' + playerId, {},
      { withCredentials: true })
  }

  getLedgerCreditsSpecialists (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/ledger/creditsSpecialists',
      { withCredentials: true })
  }
  
  forgiveDebtCreditsSpecialists (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ledger/creditsSpecialists/forgive/' + playerId, {},
      { withCredentials: true })
  }

  settleDebtCreditsSpecialists (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ledger/creditsSpecialists/settle/' + playerId, {},
      { withCredentials: true })
  }
}

export default new LedgerService()
