import axios from 'axios'
import BaseApiService from './base'

class EventService extends BaseApiService {
  
  getEvents (gameId, page, pageSize, category) {
    const url = `${this.BASE_URL}game/${gameId}/events?page=${page}&pageSize=${pageSize}&category=${category}`
    
    return axios.get(url,
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
