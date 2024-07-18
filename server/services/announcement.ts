import Repository from "./repository";
import {Announcement} from "./types/Announcement";
import {DBObjectId, objectId} from "./types/DBObjectId";
import UserService from "./user";
import ValidationError from "../errors/validation";
import {Model} from "mongoose";

export default class AnnouncementService {
    announcementModel: Model<Announcement>;
    announcementRepo: Repository<Announcement>;
    userService: UserService;

    constructor(announcementModel, announcementRepo: Repository<Announcement>, userService: UserService) {
        this.announcementModel = announcementModel;
        this.announcementRepo = announcementRepo;
        this.userService = userService;
    }

    async getLatestAnnouncement(): Promise<Announcement | null> {
        return this.announcementModel.findOne({}).sort({ date: 1 }).exec();
    }

    async getAnnouncementState(userId: DBObjectId) {

    }

    async markAsRead(userId: DBObjectId) {

    }

    async getAllAnnouncements(): Promise<Announcement[]> {
        return this.announcementModel.find().sort({ date: 1 }).exec();
    }

    async createAnnouncement(title: String, date: Date, content: String) {
        const doc: Announcement = { _id: objectId(), title, date, content };
        await this.announcementRepo.insertOne(doc);
    }

    async deleteAnnouncement(announcementId: DBObjectId | undefined) {
        if (!announcementId) {
            throw new ValidationError("Announcement ID is required");
        }
    }
}