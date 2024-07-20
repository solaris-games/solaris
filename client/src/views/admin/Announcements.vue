<template>
  <administration-page title="Announcements" name="announcements">
    <loading-spinner :loading="!announcements"/>

    <div v-if="announcements">
      <create-announcement @onAnnouncementCreated="updateAnnouncements" />

      <h4>Announcements</h4>

      <div class="announcement-list" v-for="announcement in announcements" :key="announcement._id">
        <announcement :announcement="announcement" />
      </div>
    </div>
  </administration-page>
</template>

<script>
import AdministrationPage from "./AdministrationPage.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import CreateAnnouncement from "./components/CreateAnnouncement.vue";
import Announcement from "../components/Announcement.vue";
import AnnouncementsApiService from "../../services/api/announcements";
import AdminApiService from "../../services/api/admin";

export default {
  name: "Announcements",
  components: {
    'administration-page': AdministrationPage,
    'loading-spinner': LoadingSpinner,
    'create-announcement': CreateAnnouncement,
    'announcement': Announcement
  },
  data: () => {
    return {
      announcements: null
    }
  },
  async mounted () {
    await this.updateAnnouncements();
  },
  methods: {
    async updateAnnouncements () {
      this.announcements = await this.getAnnouncements();
    },
    async getAnnouncements() {
      const resp = await AnnouncementsApiService.getAnnouncements();

      if (resp.status !== 200) {
        this.$toasted.error(resp.data.message)
        return
      }

      return resp.data
    },
  },
}
</script>

<style scoped>

</style>
