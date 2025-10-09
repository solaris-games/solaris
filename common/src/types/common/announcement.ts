export type Announcement<ID> = {
    _id: ID,
    title: String,
    date: Date,
    content: String
}

export type AnnouncementState<ID> = {
    lastReadAnnouncement: ID | null,
    unreadAnnouncements: ID[],
    unreadCount: number,
    totalAnnouncements: number
}
