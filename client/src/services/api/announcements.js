import BaseApiService from "./base";
import axios from "axios";

class AnnouncementsService extends BaseApiService {
  getCurrentAnnouncements () {
    return axios.get(`${this.BASE_URL}announcements/`, { withCredentials: true });
  }

  getLatestAnnouncement () {
    return axios.get(`${this.BASE_URL}announcements/latest/`, { withCredentials: true });
  }

  getAnnouncementState () {
    return axios.get(`${this.BASE_URL}announcements/state/`, { withCredentials: true });
  }

  markAsRead () {
    return axios.patch(`${this.BASE_URL}announcements/state/markAsRead/`, {}, { withCredentials: true });
  }
}

export default new AnnouncementsService();
