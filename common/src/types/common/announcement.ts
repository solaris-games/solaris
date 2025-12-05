export type Announcement<ID> = {
    _id: ID,
    title: string,
    date: Date,
    content: string
}

export type AnnouncementState<ID> = {
    lastReadAnnouncement: ID | null,
    unreadAnnouncements: ID[],
    unreadCount: number,
    totalAnnouncements: number
}
