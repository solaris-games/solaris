<template>
  <administration-page title="Announcements" name="announcements">
    <loading-spinner :loading="!announcements"/>

    <div v-if="announcements">
      <create-announcement @onAnnouncementCreated="updateAnnouncements" />

      <h4>Announcements</h4>

      <div class="announcement-list" v-for="announcement in announcements" :key="announcement._id">
        <announcement :announcement="announcement">
          <template v-slot:context-actions>
            <button class="btn btn-outline-danger btn-sm" @click="deleteAnnouncement(announcement)">Delete</button>
          </template>
        </announcement>
      </div>
    </div>
  </administration-page>
</template>

<script>
import AdministrationPage from "./AdministrationPage.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import CreateAnnouncement from "./components/CreateAnnouncement.vue";
import Announcement from "../components/Announcement.vue";
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
    async getAnnouncements () {
      const resp = await AdminApiService.getAllAnnouncements();

      if (resp.status !== 200) {
        this.$toast.error(resp.data.message)
        return
      }

      return resp.data
    },
    async deleteAnnouncement (announcement) {
      if (await this.$confirm("Delete announcement", `Are you sure you want to delete the announcement "${announcement.title}"?`)) {
        const resp = await AdminApiService.deleteAnnouncement(announcement._id);

        if (resp.status !== 204) {
          this.$toast.error(resp.data.message)
          return
        }

        await this.updateAnnouncements();
      }
    }
  },
}
</script>

<style scoped>

</style>
