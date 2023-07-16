import axios from 'axios'
import BaseApiService from './base'

class SpecialistService extends BaseApiService {
  listBans () {
    return axios.get(this.BASE_URL + 'game/specialists/bans',
    { withCredentials: true })
  }

  getCarrierSpecialists (gameId) {
    if (gameId) {
      return axios.get(this.BASE_URL + 'game/' + gameId + '/specialists/carrier',
        { withCredentials: true })
    }

    return axios.get(this.BASE_URL + 'game/specialists/carrier',
      { withCredentials: true })
  }
  getStarSpecialists (gameId) {
    if (gameId) {
      return axios.get(this.BASE_URL + 'game/' + gameId + '/specialists/star',
        { withCredentials: true })
    }

    return axios.get(this.BASE_URL + 'game/specialists/star',
      { withCredentials: true })
  }

  hireCarrierSpecialist (gameId, carrierId, specialistId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/carrier/' + carrierId + '/hire/' + specialistId, {},
      { withCredentials: true })
  }

  hireStarSpecialist (gameId, starId, specialistId) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/star/' + starId + '/hire/' + specialistId, {},
      { withCredentials: true })
  }
}

export default new SpecialistService()
