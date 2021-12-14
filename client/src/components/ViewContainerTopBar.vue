<template>
<div class="container col-xs-12 col-sm-10 col-md-10 col-lg-6 pr-1 pl-1" v-if="userId">
  <div class="row no-gutters pb-0 pt-1">
    <div class="col">
      <router-link to="/account/settings"><i class="fas fa-user mr-1"></i>{{username || 'My account'}}</router-link>
    </div>
    <div class="col-auto">
      <router-link :to="{ name: 'administration'}" v-if="userHasAdminRole">
        <i class="fas fa-users-cog"></i>
        <span class="d-none d-md-inline-block ml-1">Admin</span>
      </router-link>
      <router-link :to="{ name: 'account-achievements', params: { userId: userId }}" class="ml-3">
        <i class="fas fa-medal"></i>
        <span class="d-none d-md-inline-block ml-1">Achievements</span>
      </router-link>
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
      this.$store.commit('clearRoles')

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
    userHasAdminRole () {
      return this.$store.state.roles && (this.$store.state.roles.administrator || this.$store.state.roles.communityManager || this.$store.state.roles.gameMaster)
    }
  }
}
</script>

<style scoped>
.row {
  padding-bottom: 15px;
}

.container {
  font-size: 20px;
}
</style>
