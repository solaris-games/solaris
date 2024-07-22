<template>
  <loading-spinner v-if="!announcement" />
  <div class="mt-4" v-else>
    <h4>Latest Updates</h4>

    <announcement :announcement="announcement" />
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
  }
}
</script>

<style scoped>

</style>
