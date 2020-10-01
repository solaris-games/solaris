import axios from 'axios'
import BaseApiService from './base'

// TODO: This is wrong, should be LedgerService.
class CarrierService extends BaseApiService {
  getLedger (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/ledger',
      { withCredentials: true })
  }

  forgiveDebt (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ledger/forgive/' + playerId, {},
      { withCredentials: true })
  }

  settleDebt (gameId, playerId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/ledger/settle/' + playerId, {},
      { withCredentials: true })
  }
}

export default new CarrierService()
