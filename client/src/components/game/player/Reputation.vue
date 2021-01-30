<template>
  <div class="row" v-if="player && player.reputation">
    <div class="col">
      <p>
        <small>
          <i>
            Your reputation with this player is <span :class="{'text-danger':player.reputation.score < 0,'text-success':player.reputation.score > 0}">{{player.reputation.score}}</span>. Send credits or technology to increase your reputation.
          </i>
        </small>
      </p>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    playerId: String
  },
  data () {
    return {
      player: null
    }
  },
  mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)
  }
}
</script>

<style scoped>
</style>
