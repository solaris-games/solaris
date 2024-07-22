<template>
  <div class="m-1 mb-2">
    <button class="btn btn-info" type="button" @click="openAnnouncements">
      <span class="badge bg-default" v-if="announcementState?.unreadCount">{{ announcementState.unreadCount }}</span>
      Announcements
    </button>
  </div>
</template>

<script>
import AnnouncementsApiService from "../../services/api/announcements";

export default {
  name: "AnnouncementsButton",
  data () {
    return {
      announcementState: null
    }
  },
  async mounted () {
    const resp = await AnnouncementsApiService.getAnnouncementState();

    if (resp.status === 200) {
      this.announcementState = resp.data;
    } else {
      console.error(resp);
    }
  },
  methods: {
    openAnnouncements () {
      this.$router.push({ name: 'announcements' })
    }
  }
}
</script>

<style scoped>

</style>
