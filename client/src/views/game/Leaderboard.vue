<template>
  <view-container :is-auth-page="true">
    <view-title title="Leaderboards" />

    <ul class="nav nav-tabs">
      <li class="nav-item">
          <a class="nav-link active" data-bs-toggle="tab" href="#players">All Players</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#elos">ELO</a>
      </li>
      <li class="nav-item">
          <a class="nav-link" data-bs-toggle="tab" href="#guilds">Guilds</a>
      </li>
    </ul>

    <div class="tab-content pt-2">
      <leaderboard-user-table :limit="100"></leaderboard-user-table>
      <leaderboard-user-elo-table :limit="100"></leaderboard-user-elo-table>
      <leaderboard-guild-table></leaderboard-guild-table>
    </div>

  </view-container>
</template>

<script setup lang="ts">
import ViewContainer from '../components/ViewContainer.vue'
import ViewTitle from '../components/ViewTitle.vue'
import LeaderboardUserTable from './components/menu/LeaderboardUserTable.vue'
import LeaderboardUserEloTable from './components/menu/LeaderboardUserEloTable.vue'
import LeaderboardGuildTable from './components/menu/LeaderboardGuildTable.vue'
</script>

<style scoped>
</style>
