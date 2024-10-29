<template>
    <div v-if="isTradeAllowed">
      <reputation v-if="player.isAIControlled" :playerId="player._id"/>

      <div v-if="isTradePossibleByScanning && isTradePossibleByDiplomacy">
        <sendCredits v-if="tradeCreditsIsEnabled" :player="player" :userPlayer="userPlayer"/>
        <sendCreditsSpecialists v-if="tradeCreditsSpecialistsIsEnabled" :player="player" :userPlayer="userPlayer"/>
        <sendTechnology v-if="player && tradeTechnologyIsEnabled" :playerId="player._id"/>
      </div>

      <p v-if="!isTradePossibleByScanning" class="text-danger pt-2 pb-0 mb-0">You cannot trade with this player, they are not within scanning range.</p>
      <p v-if="!isTradePossibleByDiplomacy" class="text-danger pt-2 pb-0 mb-0">You cannot trade with this player, they are not an ally.</p>
    </div>
</template>

<script>
import SendTechnology from './SendTechnology.vue'
import SendCredits from './SendCredits.vue'
import SendCreditsSpecialists from './SendCreditsSpecialists.vue'
import Reputation from './Reputation.vue'
import GameHelper from '../../../../services/gameHelper'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import DiplomacyApiService from '../../../../services/api/diplomacy'

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
      userPlayer: null,
      diplomaticStatus: null
    }
  },
  async mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

    await this.loadDiplomaticStatus()
  },
  methods: {
    async loadDiplomaticStatus () {
      if (!DiplomacyHelper.isFormalAlliancesEnabled(this.$store.state.game) || !DiplomacyHelper.isTradeRestricted(this.$store.state.game)) {
        return
      }

      try {
        const response = await DiplomacyApiService.getDiplomaticStatusToPlayer(this.$store.state.game._id, this.player._id)

        if (response.status === 200) {
          this.diplomaticStatus = response.data
        }
      } catch (err) {
        console.error(err)
        this.diplomaticStatus = null
      }
    }
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
    isTradePossibleByScanning: function () {
      return (this.player.stats.totalStars > 0 || GameHelper.isDarkModeExtra(this.$store.state.game))
        && (this.$store.state.game.settings.player.tradeScanning === 'all' || (this.player && this.player.isInScanningRange))
    },
    isTradePossibleByDiplomacy: function () {
      return !DiplomacyHelper.isFormalAlliancesEnabled(this.$store.state.game) ||
        !DiplomacyHelper.isTradeRestricted(this.$store.state.game) ||
        (this.diplomaticStatus && this.diplomaticStatus.actualStatus == 'allies')
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
