<template>
  <view-container>
    <view-title title="Leaderboard" />

    <loading-spinner :loading="!leaderboard"/>

    <leaderboard-table :leaderboard="leaderboard"></leaderboard-table>
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
          leaderboard: null
      }
  },
  async mounted () {
      this.leaderboard = null

      try {
          let response = await UserApiService.getLeaderboard()

          if (response.status === 200) {
              this.leaderboard = response.data
          }
      } catch (err) {
          console.error(err)
      }
  }
}
</script>

<style scoped>
</style>
