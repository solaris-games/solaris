<template>
  <p class="team-name" v-if="team">({{team.name}})</p>
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
.team-name {
  color: #4e9cff;
  font-size: 14px;
  margin-bottom: 0;
}
</style>
