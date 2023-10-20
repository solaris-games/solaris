<template>
  <div class="row">
    <p>Team Leaderboard</p>
    <ul>
      <li v-for="team in sortedTeams" :key="team.team.name">
        {{team.team.name}}
      </li>
    </ul>
  </div>
</template>

<script>
import GameHelper from '@/services/gameHelper';

export default {
  computed: {
    sortedTeams() {
      return GameHelper.getSortedLeaderboardTeamList(this.$store.state.game)
    }
  }
}
</script>

<style scoped>

</style>
