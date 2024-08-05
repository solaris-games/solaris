import {DBObjectId} from "./DBObjectId";

export interface Announcement {
    _id: DBObjectId,
    title: String,
    date: Date,
    content: String
}

export interface AnnouncementState {
    unreadAnnouncements: number;
    lastReadAnnouncement: DBObjectId;
}
