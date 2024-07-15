import Repository from "./repository";
import {Announcement} from "./types/Announcement";
import {DBObjectId} from "./types/DBObjectId";
import UserService from "./user";

export default class AnnouncementService {
    announcementModel;
    announcementRepo: Repository<Announcement>;
    userService: UserService;

    constructor(announcementModel, announcementRepo: Repository<Announcement>, userService: UserService) {
        this.announcementModel = announcementModel;
        this.announcementRepo = announcementRepo;
        this.userService = userService;
    }

    async getLatestAnnouncement() {

    }

    async getAnnouncementState(userId: DBObjectId) {

    }

    async markAsRead(userId: DBObjectId) {

    }

    async getUnreadAnnouncements(userId: DBObjectId) {

    }

    async getAllAnnouncements(userId: DBObjectId) {

    }
}