import axios from 'axios'
import BaseApiService from './base'

class SpecialistService extends BaseApiService {
  getCarrierSpecialists (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/specialists/carrier',
      { withCredentials: true })
  }

  hireCarrierSpecialist (gameId, carrierId, specialistId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/hire/' + specialistId, {},
      { withCredentials: true })
  }
}

export default new SpecialistService()
