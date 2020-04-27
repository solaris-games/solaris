import axios from 'axios'
import BaseApiService from './base'

class StarService extends BaseApiService {

  upgradeEconomy (gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/economy', {
      starId
    },
    { withCredentials: true })
  }

  upgradeIndustry (gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/industry', {
      starId
    },
    { withCredentials: true })
  }

  upgradeScience (gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/science', {
      starId
    },
    { withCredentials: true })
  }

  bulkInfrastructureUpgrade (gameId, infrastructure, amount) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/bulk', {
      infrastructure,
      amount
    },
    { withCredentials: true })
  }

  buildWarpGate (gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/build/warpgate', {
      starId
    },
    { withCredentials: true })
  }

  destroyWarpGate (gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/destroy/warpgate', {
      starId
    },
    { withCredentials: true })
  }

  abandonStar (gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/abandon', {
      starId
    },
    { withCredentials: true })
  }

  buildCarrier (gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/build/carrier', {
      starId
    },
    { withCredentials: true })
  }

}

export default new StarService()
