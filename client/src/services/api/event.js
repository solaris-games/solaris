import axios from 'axios'
import BaseApiService from './base'

class EventService extends BaseApiService {
  
  getEvents (gameId, startTick = 0) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/events?startTick=' + startTick.toString(),
      { withCredentials: true })
  }

  getTradeEvents (gameId, startTick = 0) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/events/trade?startTick=' + startTick.toString(),
      { withCredentials: true })
  }

  markEventAsRead (gameId, eventId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/events/' + eventId + '/markAsRead', {},
      { withCredentials: true })
  }

  markAllEventsAsRead (gameId) {
    return axios.patch(this.BASE_URL + 'game/' + gameId + '/events/markAsRead', {},
      { withCredentials: true })
  }

  getUnreadCount (gameId) {
    return axios.get(this.BASE_URL + 'game/' + gameId + '/events/unread',
      { withCredentials: true })
  }

}

export default new EventService()
