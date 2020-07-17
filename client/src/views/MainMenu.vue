<template>
  <div class="container bg-dark mt-5">
    <div class="row bg-primary pt-3 pb-2 mb-2">
      <div class="col">
          <h1>Solaris</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-6">
        <p>The multiplayer game of Strategy, Intrigue and Galactic Conquest.</p>
        <p>Welcome back<span v-if="user">, <span class="text-warning">{{user.username}}</span></span>!</p>
      </div>
      <div class="col-6">
        <!-- player quick stats -->
        <achievements v-if="achievements" v-bind:victories="achievements.victories" v-bind:rank="achievements.rank" v-bind:renown="achievements.renown"
          style="margin-right: 0px;"/>
        <loading-spinner :loading="!achievements"></loading-spinner>
      </div>
    </div>
    <div class="row">
      <div class="col-8">
        <h4>Leaderboard</h4>
        <leaderboard-table if="leaderboard" :leaderboard="leaderboard"></leaderboard-table>
        <loading-spinner :loading="!leaderboard"></loading-spinner>
      </div>
      <div class="col-4">
        <div>
          <router-link to="/game/active-games" tag="button" class="btn btn-block btn-success">My Games</router-link>
          <router-link to="/game/list" tag="button" class="btn btn-block btn-success">Join Game</router-link>
          <router-link to="/leaderboard" tag="button" class="btn btn-block btn-info">Leaderboard</router-link>
          <router-link to="/game/create" tag="button" class="btn btn-block btn-primary">Create Game</router-link>
        </div>

        <div class="mt-3">
          <router-link v-if="user" :to="{ name: 'account-achievements', params: { userId: user._id }}" tag="button" class="btn btn-block btn-primary">Achievements</router-link>
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
      </div>
    </div>
  </div>
</template>

<script>
import LoadingSpinnerVue from '../components/LoadingSpinner'
import router from '../router'
import authService from '../services/api/auth'
import userService from '../services/api/user'
import ViewContainer from '../components/ViewContainer'
import Achievements from '../components/game/player/Achievements'
import LeaderboardTable from '../components/game/menu/LeaderboardTable'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'view-container': ViewContainer,
    'achievements': Achievements,
    'leaderboard-table': LeaderboardTable
  },
  data () {
    return {
      user: null,
      achievements: null,
      leaderboard: null,
      isLoggingOut: false
    }
  },
  mounted () {
    this.loadAchievements()
    this.loadLeaderboard()
  },
  methods: {
    async logout () {
      this.isLoggingOut = true

      await authService.logout()

      this.$store.commit('clearUserId')
          
      this.isLoggingOut = false

      router.push({ name: 'home' })
    },
    async loadAchievements () {
      try {
        let response = await userService.getMyUserInfo()

        this.user = response.data
        this.achievements = response.data.achievements
      } catch (err) {
        console.error(err)
      }
    },
    async loadLeaderboard () {
      try {
        let response = await userService.getLeaderboard(6)

        this.leaderboard = response.data
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>

<style scoped>
button {
  display: block;
}

.row {
  padding-bottom: 15px;
}
</style>
