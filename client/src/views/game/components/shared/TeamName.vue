<template>
  <span class="team-game" v-if="team">({{team.name}})</span>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  props: {
    playerId: String
  },
  computed: {
    team () {
      const player = GameHelper.getPlayerById(this.$store.state.game, this.playerId);
      return GameHelper.getTeamByPlayer(this.$store.state.game, player);
    }
  }
}

</script>

<style scoped>
.team-game {
  color: #4e9cff;
}
</style>
