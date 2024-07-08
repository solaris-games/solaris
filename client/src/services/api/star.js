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

  bulkInfrastructureUpgrade (gameId, upgradeStrategy, infrastructure, amount) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/bulk', {
      upgradeStrategy,
      infrastructure,
      amount
    },
    { withCredentials: true })
  }

  checkBulkUpgradedAmount (gameId, upgradeStrategy, infrastructure, amount) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/bulkCheck', {
        upgradeStrategy,  
        infrastructure,
        amount
      },
      { withCredentials: true })
  }

  scheduleBulkInfrastructureUpgrade (gameId, buyType, infrastructureType, amount, repeat, tick) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/scheduleBulk', {
      buyType,
      infrastructureType,
      amount,
      repeat,
      tick
    },
    { withCredentials: true })
  }

  bulkScheduleRepeatChanged (gameId, actionId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/toggleBulkRepeat', {
      actionId
    },
    { withCredentials: true })
  }

  trashScheduledUpgrade (gameId, actionId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/upgrade/trashBulk', {
      actionId
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

  buildCarrier (gameId, starId, ships = 1) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/build/carrier', {
      starId,
      ships
    },
    { withCredentials: true })
  }

  transferAllToStar(gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/' + starId + '/transferall', { },
    { withCredentials: true })
  }

  distributeAllShips(gameId, starId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/' + starId + '/distributeall', { },
    { withCredentials: true })
  }
  
  toggleIgnoreBulkUpgrade(gameId, starId, infrastructureType) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/toggleignorebulkupgrade', {
      starId,
      infrastructureType
    },
    { withCredentials: true })
  }
  
  toggleIgnoreBulkUpgradeAll(gameId, starId, ignoreStatus) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/toggleignorebulkupgradeall', {
      starId,
      ignoreStatus
    },
    { withCredentials: true })
  }
}

export default new StarService()
