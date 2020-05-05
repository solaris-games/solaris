<template>
<tr>
    <td><i class="fas fa-circle" v-if="carrier.ownedByPlayerId" :style="{ 'color': getColour() }"></i></td>
    <td><a href="#" @click="clickCarrier">{{carrier.name}}</a></td>
    <td><a href="#" @click="goToCarrier"><i class="far fa-eye"></i></a></td>
    <td>{{carrier.ships}}</td>
    <td>{{carrier.waypoints.length}}</td>
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
    game: Object,
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

    if (!this.game.state.paused) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 100)
    }
  },
  methods: {
    getColour () {
      return GameHelper.getPlayerColour(this.game, this.carrier.ownedByPlayerId)
    },
    clickCarrier (e) {
      gameContainer.map.clickCarrier(this.carrier._id)

      e.preventDefault()
    },
    goToCarrier (e) {
      gameContainer.map.zoomToLocation(this.carrier.location)

      e.preventDefault()
    },
    recalculateTimeRemaining () {
      this.timeRemainingEta = GameHelper.getCountdownTimeString(this.carrier.eta)
      // this.timeRemainingEtaTotal = GameHelper.getCountdownTimeString(this.carrier.etaTotal)
    }
  }
}
</script>

<style scoped>
</style>
