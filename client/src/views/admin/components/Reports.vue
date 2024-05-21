<template>
  <div>
    <loading-spinner :loading="!reports"/>

    <div v-if="reports">
      <h4 class="mb-1">Recent Reports</h4>
      <table class="mt-2 table table-sm table-striped table-responsive">
        <thead class="table-dark">
        <tr>
          <th>Player</th>
          <th>Reported By</th>
          <th>Reasons</th>
          <th>Game</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="report of reports" :key="report._id">
          <td>
            <i class="fas fa-user clickable text-info" @click="impersonate(report.reportedUserId)"
               title="Impersonate User"></i>
            {{ report.reportedPlayerAlias }}
          </td>
          <td>
            <i class="fas fa-user clickable text-info" @click="impersonate(report.reportedByUserId)"
               title="Impersonate User"></i>
            {{ report.reportedByPlayerAlias }}
          </td>
          <td>
            <span v-if="report.reasons.abuse" class="me-2">Abuse</span>
            <span v-if="report.reasons.spamming" class="me-2">Spamming</span>
            <span v-if="report.reasons.multiboxing" class="me-2">Multiboxing</span>
            <span v-if="report.reasons.inappropriateAlias" class="me-2">Inappropriate Alias</span>
          </td>
          <td>
            <router-link :to="{ path: '/game/detail', query: { id: report.gameId } }">View</router-link>
          </td>
          <td>
            <i class="fas clickable"
               :class="{'fa-check text-success':report.actioned,'fa-times text-danger':!report.actioned}"
               @click="actionReport(report)" title="Action Report"></i>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import AdminApiService from "../../../services/api/admin";
import router from "../../../router";
import LoadingSpinner from "../../components/LoadingSpinner.vue";

export default {
  name: "Reports",
  components: {
    'loading-spinner': LoadingSpinner
  },
  data() {
    return {
      reports: null
    }
  },
  async mounted() {
    await this.getReports();
  },
  methods: {
    async getReports() {
      const reports = await AdminApiService.getReports()
      if (reports.status !== 200) {
        this.$toasted.error(reports.data.message);
        return;
      }
      this.reports = reports.data;
    },
    async impersonate(userId) {
      try {
        let response = await AdminApiService.impersonate(userId)

        if (response.status === 200) {
          this.$store.commit('setUserId', response.data._id)
          this.$store.commit('setUsername', response.data.username)
          this.$store.commit('setRoles', response.data.roles)
          this.$store.commit('setUserCredits', response.data.credits)
        }

        router.push({name: 'home'})
      } catch (err) {
        console.error(err)
      }
    },
    async actionReport(report) {
      if (!await this.$confirm('Action Report', 'Are you sure you want to action this report?')) {
        return
      }

      try {
        report.actioned = true

        await AdminApiService.actionReport(report._id)
      } catch (err) {
        console.error(err)
      }
    },
  },
}
</script>

<style scoped>

</style>
