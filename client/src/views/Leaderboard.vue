<template>
  <view-container>
    <view-title title="Leaderboards" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-toggle="tab" href="#players">All Players</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#elos">ELO</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-toggle="tab" href="#guilds">Guilds</a>
      </li>
    </ul>

    <div class="tab-content pt-2">
      <leaderboard-user-table :limit="100"></leaderboard-user-table>
      <leaderboard-user-elo-table :limit="100"></leaderboard-user-elo-table>
      <leaderboard-guild-table></leaderboard-guild-table>
    </div>

  </view-container>
</template>

<script>
import ViewContainer from '../components/ViewContainer'
import ViewTitle from '../components/ViewTitle'
import LoadingSpinner from '../components/LoadingSpinner'
import LeaderboardUserTable from '../components/game/menu/LeaderboardUserTable'
import LeaderboardUserEloTable from '../components/game/menu/LeaderboardUserEloTable'
import LeaderboardGuildTable from '../components/game/menu/LeaderboardGuildTable'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle,
    'loading-spinner': LoadingSpinner,
    'leaderboard-user-table': LeaderboardUserTable,
    'leaderboard-user-elo-table': LeaderboardUserEloTable,
    'leaderboard-guild-table': LeaderboardGuildTable
  }
}
</script>

<style scoped>
</style>
