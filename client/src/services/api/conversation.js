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

  pinMessage (gameId, conversationId, messageId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/pin/' + messageId, { },
    { withCredentials: true })
  }

  unpinMessage (gameId, conversationId, messageId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/unpin/' + messageId, { },
    { withCredentials: true })
  }

  mute (gameId, conversationId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/mute', { },
    { withCredentials: true })
  }

  unmute (gameId, conversationId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/conversations/' + conversationId + '/unmute', { },
    { withCredentials: true })
  }

}

export default new ConversationService()
