<template>
  <div class="row">
    <div class="team-row" v-for="team in sortedTeams" :key="team.team.name">
      <p class="team-info">
        <span class="team-name">
          {{team.team.name}}
        </span>
        <span v-if="isHomeStarsWinCondition" class="team-score">
          <i class="fas fa-star me-0"></i>
          {{team.totalHomeStars}}
        </span>
        <span v-if="isStarCountWinCondition" class="team-score">
          <i class="fas fa-star me-0"></i>
          {{team.totalStars}}
        </span>
      </p>
      <p class="team-members">
        <span class="team-player-link" v-for="player in team.players" :key="player._id" @click="panToPlayer(player)">
          {{player.alias}}
        </span>
      </p>
    </div>
  </div>
</template>

<script>
import GameHelper from '@/services/gameHelper';
import gameContainer from '@/game/container';

export default {
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e._id)
    },
    panToPlayer (player) {
      gameContainer.map.panToPlayer(this.$store.state.game, player)
      this.onOpenPlayerDetailRequested(player)
    },
  },
  computed: {
    sortedTeams() {
      return GameHelper.getSortedLeaderboardTeamList(this.$store.state.game)
    },
    isHomeStarsWinCondition () {
      return GameHelper.isWinConditionHomeStars(this.$store.state.game)
    },
    isStarCountWinCondition () {
      return GameHelper.isWinConditionStarCount(this.$store.state.game)
    },
  }
}
</script>

<style scoped>
.team-player-link {
  cursor: pointer;
  text-decoration: underline;
  color: var(--bs-theme);
}

.team-player-link:hover {
  color: rgba(var(--bs-theme-rgb),.75);
}
</style>
