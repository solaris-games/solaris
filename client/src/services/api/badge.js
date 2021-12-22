import axios from 'axios'
import BaseApiService from './base'

class BadgeApiService extends BaseApiService {

  listBadges () {
    return axios.get(this.BASE_URL + 'badges',
      { withCredentials: true })
  }

  listBadgesByUser (userId) {
    return axios.get(this.BASE_URL + 'badges/user/' + userId,
      { withCredentials: true })
  }

  listBadgesByPlayer (gameId, playerId) {
    return axios.get(this.BASE_URL + 'badges/game/' + gameId + '/player/' + playerId,
      { withCredentials: true })
  }

  purchaseBadgeForUser (userId, badgeKey) {
    return axios.post(this.BASE_URL + 'badges/user/' + userId,
      { badgeKey },
      { withCredentials: true })
  }

  purchaseBadgeForPlayer (gameId, playerId, badgeKey) {
    return axios.post(this.BASE_URL + 'badges/game/' + gameId + '/player/' + playerId,
      { badgeKey },
      { withCredentials: true })
  }

}

export default new BadgeApiService()
