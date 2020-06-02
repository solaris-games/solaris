<template>
  <view-container>
    <view-title title="Leaderboard" />

    <loading-spinner :loading="!leaderboard"/>

    <div class="table-responsive">
        <table class="table" v-if="leaderboard">
            <thead>
                <th>#</th>
                <th>Player</th>
                <th class="text-right">Rank</th>
                <th class="text-right">Victories</th>
                <th class="text-right">Renown</th>
            </thead>
            <tbody>
                <tr v-for="player in leaderboard" :key="player._id">
                    <td>{{player.position}}</td>
                    <td>{{player.username}}</td>
                    <td align="right">{{player.achievements.rank}}</td>
                    <td align="right">{{player.achievements.victories}}</td>
                    <td align="right">{{player.achievements.renown}}</td>
                </tr>
            </tbody>
        </table>
    </div>
  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import UserApiService from '../services/api/user'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner
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
