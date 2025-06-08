<template>
  <loading-spinner :loading="!announcement" />
  <div class="mt-4" v-if="announcement">
    <h5 class="latest-update-title">Latest Update: {{date}}</h5>

    <details>
      <summary>More...</summary>

      <announcement :announcement="announcement" />
    </details>
  </div>
</template>

<script>
import Announcement from "./Announcement.vue";
import AnnouncementsApiService from "../../services/api/announcements";
import LoadingSpinner from "./LoadingSpinner.vue";

export default {
  name: "LatestAnnouncement",
  components: {
    'loading-spinner': LoadingSpinner,
    'announcement': Announcement
  },
  data () {
    return {
      announcement: null,
    }
  },
  async mounted () {
    const resp = await AnnouncementsApiService.getLatestAnnouncement();

    if (resp.status === 200) {
      this.announcement = resp.data;
    } else {
      console.error(resp);
    }
  },
  computed: {
    date () {
      return new Date(this.announcement.date).toLocaleString()
    }
  }
}
</script>

<style scoped>
.latest-update-title {
  font-size: 1rem;
  font-weight: normal;
}
</style>
