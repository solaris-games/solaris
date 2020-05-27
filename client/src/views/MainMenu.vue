<template>
  <view-container>
    <h1>Main Menu</h1>

    <div>
      <router-link to="/game/active-games" tag="button" class="btn btn-block btn-success">My Games</router-link>
      <router-link to="/game/list" tag="button" class="btn btn-block btn-success">Join Game</router-link>
      <router-link to="/leaderboard" tag="button" class="btn btn-block btn-info">Leaderboard</router-link>
      <router-link to="/game/create" tag="button" class="btn btn-block btn-primary">Create Game</router-link>
    </div>

    <div class="mt-3">
      <router-link to="/account/achievements" tag="button" class="btn btn-block btn-primary">Achievements</router-link>
      <router-link to="/account/settings" tag="button" class="btn btn-block btn-primary">Account Settings</router-link>
      <router-link to="/codex" tag="button" class="btn btn-block btn-info">Help</router-link>
    </div>

    <!--
    <div class="mt-3">
      <router-link to="/premium-store" tag="button" class="btn btn-block btn-danger">Premium Store</router-link>
    </div>
    -->

    <div class="mt-3">
      <button @click="logout" class="btn btn-block btn-danger" :disabled="isLoggingOut">Logout</button>
    </div>

    <loading-spinner :loading="isLoggingOut"/>
  </view-container>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import router from '../router'
import authService from '../services/api/auth'
import ViewContainer from '../components/ViewContainer'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer
  },
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
          
      this.isLoggingOut = false

      router.push({ name: 'home' })
    }
  }
}
</script>

<style scoped>
button {
  display: block;
}
</style>
