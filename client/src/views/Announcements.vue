<template>
  <view-container :hideTopBar="true" :is-auth-page="true">
    <view-title
      title="Announcements"
      :showSocialLinks="true"
    />

    <loading-spinner v-if="!announcementState || !announcements" />

    <div v-else>
      <p>
        <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord" style="text-decoration: none;">
          Join the Discord
        </a>to stay up-to-date, discuss the game and chat with the community!
      </p>

      <announcement
        v-for="announcement in announcements"
        :key="announcement._id"
        :announcement="announcement"
        :highlighted="isUnread(announcement)"
      />
    </div>
  </view-container>
</template>

<script>

import ViewContainer from "./components/ViewContainer.vue";
import ViewTitle from "./components/ViewTitle.vue";
import LoadingSpinner from "./components/LoadingSpinner.vue";
import Announcement from "./components/Announcement.vue";
import AnnouncementsApiService from "../services/api/announcements";

export default {
  name: "Announcements",
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'announcement': Announcement
  },
  data() {
    return {
      announcements: null,
      announcementState: null
    }
  },
  async mounted () {
    const resp1 = await AnnouncementsApiService.getAnnouncementState();

    if (resp1.status === 200) {
      this.announcementState = resp1.data;

      const resp2 = await AnnouncementsApiService.getCurrentAnnouncements();

      if (resp2.status === 200) {
        this.announcements = resp2.data;

        await AnnouncementsApiService.markAsRead();
      } else {
        console.error(resp2);
      }
    } else {
      console.error(resp1);
    }
  },
  methods: {
    isUnread (announcement) {
      if (!announcement || !this.announcementState) {
        return false;
      }

      return this.announcementState.unreadAnnouncements.includes(announcement._id);
    }
  }
}
</script>

<style scoped>

</style>
