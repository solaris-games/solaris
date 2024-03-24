<template>
  <div class="row" v-if="player && player.reputation">
    <div class="col">
      <p class="mb-1">
        <small>
          <i>
            Your reputation with this player is <span :class="{'text-danger':player.reputation.score < 0,'text-success':player.reputation.score > 0}">{{player.reputation.score}}</span>.
          </i>
        </small>
      </p>
      <p v-if="isExtraDark" class="mb-1 text-warning">
        <small>
          <i>
            Warning: since this game is extra dark, these values are estimates based on your current scanning range.
          </i>
        </small>
      </p>
      <p class="mb-1">
        <small>
          <i>
            Send Credits (<span class="text-warning">${{creditsRequired}}</span>)
            <span v-if="isSpecialistsCurrencyCreditsSpecialists">Specialist Tokens (<span class="text-warning">{{creditsSpecialistsRequired}}</span>)</span> or Technology to increase your reputation.
          </i>
        </small>
      </p>
      <p class="mb-1" v-if="isFormalAlliancesEnabled">
        <small>
          <i>
            <span>Reputation greater or equal to <span class="text-warning">5</span> will change their diplomatic status to <span class="text-success">Allied</span>.</span>
          </i>
        </small>
      </p>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import DiplomacyHelper from '../../../../services/diplomacyHelper'

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
    isSpecialistsCurrencyCreditsSpecialists () {
      return GameHelper.isSpecialistsCurrencyCreditsSpecialists(this.$store.state.game)
    },
    isFormalAlliancesEnabled () {
      return DiplomacyHelper.isFormalAlliancesEnabled(this.$store.state.game)
    },
    isExtraDark () {
      return this.$store.state.game.settings.specialGalaxy.darkGalaxy === 'extra'
    }
  }
}
</script>

<style scoped>
</style>
