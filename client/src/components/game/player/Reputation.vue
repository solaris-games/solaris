<template>
  <div class="row" v-if="player && player.reputation">
    <div class="col">
      <p>
        <small>
          <i>
            Your reputation with this player is <span :class="{'text-danger':player.reputation.score < 0,'text-success':player.reputation.score > 0}">{{player.reputation.score}}</span>.
            <br/>
            Send credits (<span class="text-warning">${{creditsRequired}}</span>)
            <span v-if="isSpecialistsTechnologyEnabled">specialist tokens (<span class="text-warning">{{creditsSpecialistsRequired}}</span>)</span> or technology to increase your reputation.
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
  },
  computed: {
    creditsRequired () {
      return this.player.stats.totalEconomy * 10 / 2
    },
    creditsSpecialistsRequired () {
      return Math.round(this.player.research.specialists.level / 2)
    },
    isSpecialistsTechnologyEnabled () {
      return this.$store.state.game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'
    }
  }
}
</script>

<style scoped>
</style>
