<template>
  <div class="row">
    <div class="team-row" v-for="team in sortedTeams" :key="team.team.name">
      <p class="team-info">
        <span class="team-name">
          {{team.team.name}}
        </span>
        <span v-if="isHomeStarsWinCondition" class="team-score">
          {{team.totalHomeStars}}
        </span>
        <span v-if="isStarCountWinCondition" class="team-score">
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
      console.log(player)
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

</style>
