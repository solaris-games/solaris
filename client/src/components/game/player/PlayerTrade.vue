<template>
    <div v-if="isTradeAllowed">
      <div v-if="isTradePossible">
        <reputation v-if="player.defeated" :playerId="player._id"/>
        <sendCredits v-if="tradeCreditsIsEnabled" :player="player" :userPlayer="userPlayer"/>
        <sendCreditsSpecialists v-if="tradeCreditsSpecialistsIsEnabled" :player="player" :userPlayer="userPlayer"/>
        <sendTechnology v-if="player && tradeTechnologyIsEnabled" :playerId="player._id"/>
      </div>

      <p v-if="!isTradePossible" class="text-danger">You cannot trade with this player, they are not within scanning range.</p>
    </div>
</template>

<script>
import SendTechnology from './SendTechnology'
import SendCredits from './SendCredits'
import SendCreditsSpecialists from './SendCreditsSpecialists'
import Reputation from './Reputation'
import GameHelper from '../../../services/gameHelper'

export default {
  components: {
    'sendTechnology': SendTechnology,
    'sendCredits': SendCredits,
    'sendCreditsSpecialists': SendCreditsSpecialists,
    'reputation': Reputation
  },
  props: {
    playerId: String
  },
  data () {
    return {
      player: null,
      userPlayer: null
    }
  },
  async mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
  },
  computed: {
    game () {
      return this.$store.state.game
    },
    isTradeAllowed () {
      return this.game.state.startDate 
        && this.userPlayer 
        && this.player != this.userPlayer 
        && !this.userPlayer.defeated 
        && !this.isGameFinished 
        && (this.tradeTechnologyIsEnabled || this.tradeCreditsIsEnabled || this.tradeCreditsSpecialistsIsEnabled)
    },
    isTradePossible: function () {
      return this.player.stats.totalStars > 0 
        && (this.$store.state.game.settings.player.tradeScanning === 'all' || (this.player && this.player.isInScanningRange))
    },
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    tradeCreditsIsEnabled () {
      return this.game.settings.player.tradeCredits
    },
    tradeCreditsSpecialistsIsEnabled () {
      return this.game.settings.player.tradeCreditsSpecialists
        && this.game.settings.specialGalaxy.specialistsCurrency === 'creditsSpecialists'
    },
    tradeTechnologyIsEnabled () {
      return this.game.settings.player.tradeCost > 0
    }
  }
}
</script>

<style scoped>
</style>
