import axios from 'axios'
import BaseApiService from './base'

class ReportApiService extends BaseApiService {

  reportPlayer (gameId, playerId, messageId, conversationId, abuse, spamming, multiboxing, inappropriateAlias) {
    return axios.post(this.BASE_URL + 'game/' + gameId + '/report',
      {
        playerId,
        messageId,
        conversationId,
        reasons: {
          abuse,
          spamming,
          multiboxing,
          inappropriateAlias
        }
      },
      { withCredentials: true })
  }

}

export default new ReportApiService()
