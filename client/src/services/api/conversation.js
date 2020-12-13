import axios from 'axios'
import BaseApiService from './base'

class ConversationService extends BaseApiService {

  list (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/conversations',
      { withCredentials: true })
  }

  detail (gameId, conversationId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId,
      { withCredentials: true })
  }

  create (gameId, name, participants) {
    return axios.post(this.BASE_URL + 'game/' + gameId + '/conversations', {
      name,
      participants
    },
    { withCredentials: true })
  }

  send (gameId, conversationId, message) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId, {
      message
    },
    { withCredentials: true })
  }

  markAsRead (gameId, conversationId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/markAsRead', { },
    { withCredentials: true })
  }

  markMessageAsRead (gameId, conversationId, messageId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/markAsRead/' + messageId, { },
    { withCredentials: true })
  }

}

export default new ConversationService()
