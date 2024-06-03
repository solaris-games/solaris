<template>
  <view-container>
    <view-title title="Administration" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
        <router-link class="nav-link" :to="{ path: '/administration/games' }">Games</router-link>
      </li>
      <li class="nav-item" v-if="isCommunityManager">
        <router-link class="nav-link" :to="{ path: '/administration/users' }">Users</router-link>
      </li>
      <li class="nav-item" v-if="isAdministrator">
        <router-link class="nav-link" :to="{ path: '/administration/passwordResets' }">Password Resets</router-link>
      </li>
      <li class="nav-item" v-if="isCommunityManager">
        <router-link class="nav-link" :to="{ path: '/administration/reports' }">Reports</router-link>
      </li>
      <li class="nav-item" v-if="isAdministrator">
        <router-link class="nav-link" :to="{ path: '/administration/insights' }">Insights</router-link>
      </li>
    </ul>

    <slot />
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import LoadingSpinner from '../components/LoadingSpinner'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner
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
