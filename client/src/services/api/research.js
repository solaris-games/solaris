import axios from 'axios'
import BaseApiService from './base'

class ResearchService extends BaseApiService {
  updateResearchNow (gameId, preference) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/research/now', {
      preference
    },
    { withCredentials: true })
  }

  updateResearchNext (gameId, preference) {
    return axios.put(this.BASE_URL + 'game/' + gameId + '/research/next', {
      preference
    },
    { withCredentials: true })
  }
}

export default new ResearchService()
