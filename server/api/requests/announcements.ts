import { Type, type Static } from '@sinclair/typebox';

export const TAnnouncement = Type.Object({
  title: Type.String(),
  content: Type.String(),
  date: Type.Date(),
});

export type AnnouncementRequest = Static<typeof TAnnouncement>;