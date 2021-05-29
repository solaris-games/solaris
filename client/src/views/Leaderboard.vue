<template>
  <view-container>
    <view-title title="Leaderboards" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-toggle="tab" href="#players">Players</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#guilds">Guilds</a>
      </li>
    </ul>

    <div class="tab-content pt-2">
      <leaderboard-user-table></leaderboard-user-table>
      <leaderboard-guild-table></leaderboard-guild-table>
    </div>

  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import LeaderboardUserTable from '../components/game/menu/LeaderboardUserTable'
import LeaderboardGuildTable from '../components/game/menu/LeaderboardGuildTable'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'leaderboard-user-table': LeaderboardUserTable,
    'leaderboard-guild-table': LeaderboardGuildTable
  }
}
</script>

<style scoped>
</style>
