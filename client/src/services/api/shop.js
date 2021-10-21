import axios from 'axios'
import BaseApiService from './base'

class ShopApiService extends BaseApiService {
  
  purchaseGalacticCredits (amount) {
    return axios.get(this.BASE_URL + 'shop/galacticcredits/purchase?amount=' + amount.toString(),
      { withCredentials: true })
  }

}

export default new ShopApiService()
