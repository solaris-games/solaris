<template>
  <administration-page title="Reports" name="reports">
    <loading-spinner :loading="!reports"/>

    <div v-if="reports">
      <div class="panel report-element" v-for="report of reports" :key="report._id">
        <div class="panel-heading">
          <h5 class="panel-title" :class="report.actioned ? 'text-default' : 'text-warning'">
            <router-link :to="{ path: '/administration/users/', query: { userId: report.reportedByUserId } }">{{ report.reportedByPlayerAlias }}</router-link>
            reported
            <router-link :to="{ path: '/administration/users/', query: { userId: report.reportedUserId } }">{{ report.reportedPlayerAlias }}</router-link>
            ({{ report.date }})
          </h5>
        </div>
        <div class="panel-body">
          <p>Reasons:
            <span v-if="report.reasons.abuse" class="me-2">Abuse</span>
            <span v-if="report.reasons.spamming" class="me-2">Spamming</span>
            <span v-if="report.reasons.multiboxing" class="me-2">Multiboxing</span>
            <span v-if="report.reasons.inappropriateAlias" class="me-2">Inappropriate Alias</span>
          </p>

          <message-report :report="report" />
        </div>
        <div class="panel-footer">
          <router-link tag="button" class="btn btn-small btn-info me-2" :to="{ path: '/game/detail', query: { id: report.gameId } }">View Game</router-link>
          <button class="btn btn-small" :class="report.actioned ? 'btn-success' : 'btn-danger'">
            <i class="fas clickable"
               :class="{'fa-check':report.actioned,'fa-times':!report.actioned}"
               @click="actionReport(report)" title="Action Report"></i>
          </button>
        </div>
      </div>
    </div>
  </administration-page>
</template>

<script>
import AdminApiService from "../../services/api/admin";
import router from "../../router";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import AdministrationPage from "./AdministrationPage.vue";
import MessageReport from "./components/MessageReport.vue";

export default {
  name: "Reports",
  components: {
    'administration-page': AdministrationPage,
    'loading-spinner': LoadingSpinner,
    'message-report': MessageReport
  },
  data() {
    return {
      reports: null
    }
  },
  async mounted() {
    this.reports = await this.getReports();
  },
  methods: {
    async getReports() {
      const reports = await AdminApiService.getReports()
      if (reports.status !== 200) {
        this.$toast.error(reports.data.message);
        return null
      }
      return reports.data;
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
.report-element {
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,.3);
  margin: 8px;
  padding: 8px;
}
</style>
