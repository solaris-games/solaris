import BaseApiService from "./base";
import axios from 'axios'

class ColourService extends BaseApiService {
  listColours () {
    return axios.get(this.BASE_URL + 'colour/list',
      { withCredentials: true });
  }

  addColour (gameId, data) {
    return axios.put(`${this.BASE_URL}game/${gameId}/colour/override`, data,
      { withCredentials: true });
  }
}

export default new ColourService();
