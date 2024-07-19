import BaseApiService from "./base";
import axios from "axios";

class AnnouncementsService extends BaseApiService {
  getAnnouncements () {
    return axios.get(`${this.BASE_URL}announcements/`, { withCredentials: true })
  }
}

export default new AnnouncementsService();
