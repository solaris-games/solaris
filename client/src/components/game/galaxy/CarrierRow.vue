<template>
<tr>
    <td><i class="fas fa-circle" v-if="carrier.ownedByPlayerId" :style="{ 'color': getColour() }"></i></td>
    <td><a href="javascript:;" @click="clickCarrier">{{carrier.name}}</a></td>
    <td><a href="javascript:;" @click="goToCarrier"><i class="far fa-eye"></i></a></td>
    <td class="text-right">{{carrier.ships == null ? '???' : carrier.ships}}</td>
    <td class="text-right">{{carrier.waypoints.length}}</td>
    <td><i class="fas fa-sync" v-if="carrier.waypointsLooped"></i></td>
    <td><span v-if="carrier.waypoints.length">{{timeRemainingEta}}</span></td>
    <!-- <td><span v-if="carrier.waypoints.length">{{timeRemainingEtaTotal}}</span></td> -->
</tr>
</template>

<script>
import gameContainer from '../../../game/container'
import GameHelper from '../../../services/gameHelper'

export default {
  components: {
  },
  props: {
    carrier: Object
  },
  data () {
    return {
      timeRemainingEta: null,
      timeRemainingEtaTotal: null,
      intervalFunction: null
    }
  },
  mounted () {
    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 100)
    }
  },
  methods: {
    getColour () {
      return GameHelper.getPlayerColour(this.$store.state.game, this.carrier.ownedByPlayerId)
    },
    clickCarrier (e) {
      this.$emit('onOpenCarrierDetailRequested', this.carrier._id)
    },
    goToCarrier (e) {
      gameContainer.map.panToLocation(this.carrier.location)
    },
    recalculateTimeRemaining () {
      let timeRemainingEtaDate = GameHelper.calculateTimeByTicks(this.carrier.ticksEta,
        this.$store.state.game.settings.gameTime.speed, this.$store.state.game.state.lastTickDate)

      this.timeRemainingEta = GameHelper.getCountdownTimeString(this.$store.state.game, timeRemainingEtaDate)

      // TODO: Get total time of carrier eta
      // this.timeRemainingEtaTotal = GameHelper.getCountdownTimeString(this.$store.state.game, this.carrier.ticksEtaTotal)
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
