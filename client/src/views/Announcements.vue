<template>
  <view-container :hideTopBar="true" :is-auth-page="true">
    <view-title
      title="Announcements"
      :showSocialLinks="true"
    />

    <loading-spinner :loading="!announcementState || !announcements" />

    <div v-if="announcements">
      <p>
        <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord" style="text-decoration: none;">
          Join the Discord
        </a>to stay up-to-date, discuss the game and chat with the community!
      </p>

      <announcement-panel
        v-for="announcement in announcements"
        :key="announcement._id"
        :announcement="announcement"
        :highlighted="isUnread(announcement)"
      />
    </div>
  </view-container>
</template>

<script setup lang="ts">
import ViewContainer from "./components/ViewContainer.vue";
import ViewTitle from "./components/ViewTitle.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import AnnouncementPanel from "./components/Announcement.vue";
import { ref, onMounted, inject, type Ref } from 'vue';
import type {Announcement, AnnouncementState} from "@solaris-common";
import {getAnnouncementState, getCurrentAnnouncements, markAsRead} from "@/services/typedapi/announcement";
import {formatError, httpInjectionKey, isError, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const announcements: Ref<Announcement<string>[] | null> = ref(null);
const announcementState: Ref<AnnouncementState<string> | null> = ref(null);

const isUnread = (announcement: Announcement<string>) => {
  if (!announcementState.value) {
    return false;
  }

  return announcementState.value.unreadAnnouncements.includes(announcement._id);
};

onMounted(async () => {
  const resp1 = await getCurrentAnnouncements(httpClient)();

  if (isOk(resp1)) {
    announcements.value = resp1.data;

    const resp2 = await getAnnouncementState(httpClient)();

    if (isOk(resp2)) {
      announcementState.value = resp2.data;

      const resp3 = await markAsRead(httpClient)();

      if (isError(resp3)) {
        console.error(formatError(resp3));
      }
    } else {
      console.error(formatError(resp2));
      toast.error("Failed to load announcement state");
    }
  } else {
    console.error(formatError(resp1));
    toast.error("Failed to load announcements");
  }
});
</script>

<style scoped>

</style>
