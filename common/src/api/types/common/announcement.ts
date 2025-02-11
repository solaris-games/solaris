export type Announcement<ID> = {
    _id: ID,
    title: String,
    date: Date,
    content: String
}

export type AnnouncementState<ID> = {
    unreadAnnouncements: number;
    lastReadAnnouncement: ID;
}
