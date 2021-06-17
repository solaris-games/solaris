import axios from 'axios'
import BaseApiService from './base'

class CarrierService extends BaseApiService {
  renameCarrier (gameId, carrierId, name) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/rename', { 
      name
    }, { withCredentials: true })
  }

  saveWaypoints (gameId, carrierId, waypoints, looped) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/waypoints', {
      waypoints,
      looped
    },
    { withCredentials: true })
  }

  loopWaypoints (gameId, carrierId, loop) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/waypoints/loop',
      {
        loop
      },
      { withCredentials: true })
  }

  transferShips (gameId, carrierId, carrierShips, starId, starShips) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/transfer',
      {
        carrierId,
        carrierShips,
        starId,
        starShips
      },
      { withCredentials: true })
  }

  convertToGift (gameId, carrierId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/gift',
      {
        carrierId
      },
      { withCredentials: true })
  }

  calculateCombat (gameId, defender, attacker, isTurnBased) {
    return axios.post(this.BASE_URL + 'game/' + gameId + '/carrier/calculateCombat',
      {
        defender,
        attacker,
        isTurnBased
      },
      { withCredentials: true })
  }
  
  scuttle (gameId, carrierId) {
    return axios.delete(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/scuttle', { withCredentials: true })
  }
}

export default new CarrierService()
