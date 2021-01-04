import axios from 'axios'
import BaseApiService from './base'

class ConversationService extends BaseApiService {

  list (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/conversations',
      { withCredentials: true })
  }

  privateChatSummary (gameId, withPlayerId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/conversations/private/' + withPlayerId,
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
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/send', {
      message
    },
    { withCredentials: true })
  }

  markAsRead (gameId, conversationId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/markAsRead', { },
    { withCredentials: true })
  }

  leave (gameId, conversationId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/leave', { },
    { withCredentials: true })
  }

  getUnreadCount (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/conversations/unread',
      { withCredentials: true })
  }

}

export default new ConversationService()
