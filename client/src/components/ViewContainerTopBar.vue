<template>
<div class="container col-xs-12 col-sm-10 col-md-10 col-lg-6 pr-1 pl-1" v-if="userId">
  <div class="row no-gutters pb-0 pt-1">
    <div class="col">
      <router-link to="/account/settings"><i class="fas fa-user mr-1"></i>{{username || 'My account'}}</router-link>
    </div>
    <div class="col-auto">
      <router-link :to="{ name: 'account-achievements', params: { userId: userId }}">
        <i class="fas fa-medal"></i>
        <span class="d-none d-md-inline-block ml-1">Achievements</span>
      </router-link>
      <a :href="documentationUrl" target="_blank" class="ml-3">
        <i class="fas fa-question"></i>
        <span class="d-none d-md-inline-block ml-1">Help</span>
      </a>
      <a href="javascript:;" @click="logout" :disabled="isLoggingOut" class="ml-3">
        <i class="fas fa-sign-out-alt"></i>
        <span class="ml-1">Log Out</span>
      </a>
    </div>
  </div>
</div>
</template>

<script>
import router from '../router'
import authService from '../services/api/auth'

export default {
  data () {
    return {
      isLoggingOut: false
    }
  },
  methods: {
    async logout () {
      this.isLoggingOut = true

      await authService.logout()

      this.$store.commit('clearUserId')
      this.$store.commit('clearUsername')

      this.isLoggingOut = false

      router.push({ name: 'home' })
    },
    routeToPath(path) {
      router.push(path)
    }
  },
  computed: {
    userId () {
      return this.$store.state.userId
    },
    username () {
      return this.$store.state.username
    },
    documentationUrl () {
      return process.env.VUE_APP_DOCUMENTATION_URL
    }
  }
}
</script>

<style scoped>
.row {
  padding-bottom: 15px;
}
</style>
