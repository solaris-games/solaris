import {date, object, string, Validator} from "../validate";

export type AnnouncementRequest = {
    title: string;
    content: string;
    date: Date;
};

export const parseAnnouncementRequest: Validator<AnnouncementRequest> = object({
    title: string,
    content: string,
    date: date
});