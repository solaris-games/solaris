<template>
  <view-container :is-auth-page="true">
    <view-title :title="title" />

    <nav>
      <ul class="nav nav-tabs" role="tablist">
        <li role="presentation" class="nav-item" :class="name === 'announcements' ? 'active' : null" v-if="isAdministrator">
          <router-link class="nav-link" :class="name === 'announcements' ? 'active' : null" :to="{ path: '/administration/announcements' }">Announcements</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'games' ? 'active' : null">
          <router-link class="nav-link" :class="name === 'games' ? 'active' : null" :to="{ path: '/administration/games' }">Games</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'users' ? 'active' : null" v-if="isCommunityManager">
          <router-link class="nav-link" :class="name === 'users' ? 'active' : null" :to="{ path: '/administration/users' }">Users</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'passwordresets' ? 'active' : null" v-if="isAdministrator">
          <router-link class="nav-link" :class="name === 'passwordresets' ? 'active' : null" :to="{ path: '/administration/passwordResets' }">Password Resets</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'reports' ? 'active' : null" v-if="isCommunityManager">
          <router-link class="nav-link" :class="name === 'reports' ? 'active' : null" :to="{ path: '/administration/reports' }">Reports</router-link>
        </li>
        <li role="presentation" class="nav-item" :class="name === 'insights' ? 'active' : null" v-if="isAdministrator">
          <router-link class="nav-link" :class="name === 'insights' ? 'active' : null" :to="{ path: '/administration/insights' }">Insights</router-link>
        </li>
      </ul>
    </nav>

    <slot />
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner
  },
  props: {
    name: String,
    title: String
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
