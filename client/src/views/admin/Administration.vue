<template>
  <view-container>
    <view-title title="Administration" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-bs-toggle="tab" href="#games">Games</a>
      </li>
      <li class="nav-item" v-if="isCommunityManager">
          <a class="nav-link" data-bs-toggle="tab" href="#users">Users</a>
      </li>
      <li class="nav-item" v-if="isAdministrator">
          <a class="nav-link" data-bs-toggle="tab" href="#passwordResets">Password Resets</a>
      </li>
      <li class="nav-item" v-if="isCommunityManager">
          <a class="nav-link" data-bs-toggle="tab" href="#reports">Reports</a>
      </li>
      <li class="nav-item" v-if="isAdministrator">
          <a class="nav-link" data-bs-toggle="tab" href="#insights">Insights</a>
      </li>
    </ul>

    <div class="tab-content pt-2">
      <div class="tab-pane fade show active" id="games">
        <games />
      </div>
      <div class="tab-pane fade" id="users" v-if="isCommunityManager">
        <users />
      </div>
      <div class="tab-pane fade" id="passwordResets" v-if="isAdministrator">
        <password-resets />
      </div>
      <div class="tab-pane fade" id="reports" v-if="isCommunityManager">
        <reports />
      </div>
      <div class="tab-pane fade" id="insights" v-if="isAdministrator">
        <insights />
      </div>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import InsightsVue from './components/Insights'
import Reports from "./components/Reports.vue";
import Users from "./components/Users.vue";
import PasswordResets from "./components/PasswordResets.vue";
import Games from "./components/Games.vue";

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'insights': InsightsVue,
    'reports': Reports,
    'users': Users,
    'password-resets': PasswordResets,
    'games': Games
  },
  computed: {
    isAdministrator () {
      return this.$store.state.roles.administrator
    },
    isCommunityManager () {
      return this.isAdministrator || this.$store.state.roles.communityManager
    }
  }
}
</script>

<style scoped>
</style>
