import axios from 'axios'
import BaseApiService from './base'

class CarrierService extends BaseApiService {
  
  saveWaypoints (gameId, carrierId, waypoints) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/waypoints', 
        waypoints,
    { withCredentials: true })
  }

}

export default new CarrierService()
