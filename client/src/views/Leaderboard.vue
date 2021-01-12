<template>
  <view-container>
    <view-title title="Leaderboard" />

    <loading-spinner :loading="!leaderboard"/>

    <div v-if="leaderboard">
      <h4 class="mb-1">Top 100 Players</h4>
      <small class="text-warning">Total Players: {{totalPlayers}}</small>
      <leaderboard-table class="mt-2" :leaderboard="leaderboard"></leaderboard-table>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import UserApiService from '../services/api/user'
import LeaderboardTable from '../components/game/menu/LeaderboardTable'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'leaderboard-table': LeaderboardTable
  },
  data () {
    return {
      leaderboard: null,
      totalPlayers: 0
    }
  },
  async mounted () {
    this.leaderboard = null

    try {
      let response = await UserApiService.getLeaderboard(100)

      if (response.status === 200) {
        this.leaderboard = response.data.leaderboard
        this.totalPlayers = response.data.totalPlayers
      }
    } catch (err) {
      console.error(err)
    }
  }
}
</script>

<style scoped>
</style>
