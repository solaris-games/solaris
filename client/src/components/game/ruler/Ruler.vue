<template>
<div class="menu-page container">
    <menu-title title="Ruler" @onCloseRequested="onCloseRequested">
        <button class="btn btn-primary" @click="resetRulerPoints"><i class="fas fa-undo"></i> Reset</button>
    </menu-title>

    <div class="row bg-secondary pt-2 pb-2">
        <div class="col-6">
            Waypoints
        </div>
        <div class="col-6 text-right">
            <i class="fas fa-map-marker-alt"></i> {{points.length}}
        </div>
    </div>

    <!-- <div class="row bg-primary pt-2 pb-2">
        <div class="col-6">
            ETA
        </div>
        <div class="col-6 text-right">
            0h
        </div>
    </div>

    <div class="row bg-secondary pt-2 pb-2">
        <div class="col-6">
            Range
        </div>
        <div class="col-6 text-right">
            {{rangeLightYears}}ly
        </div>
    </div> -->

    <div class="row bg-primary pt-2 pb-2">
        <div class="col-6">
            Hyperspace Range
        </div>
        <div class="col-6 text-right">
            <i class="fas fa-gas-pump"></i> {{hyperspaceRange}}
        </div>
    </div>

    <div class="row bg-secondary pt-2 pb-2">
        <div class="col-6">
            ETA Base Speed
        </div>
        <div class="col-6 text-right">
            {{totalEta || 'N/A'}}
        </div>
    </div>

    <div class="row bg-primary pt-2 pb-2">
        <div class="col-6">
            ETA Warp Speed
        </div>
        <div class="col-6 text-right">
            {{totalEtaWarp || 'N/A'}}
        </div>
    </div>
</div>
</template>

<script>
import MenuTitleVue from '../MenuTitle'
import GameContainer from '../../../game/container'
import GameHelper from '../../../services/gameHelper'
import * as moment from 'moment'

export default {
  components: {
    'menu-title': MenuTitleVue
  },
  data () {
    return {
      points: [],
      etaTicks: 0,
      rangeLightYears: 0,
      hyperspaceRange: 1,
      totalEta: '',
      totalEtaWarp: ''
    }
  },
  mounted () {
    // Set map to ruler mode
    GameContainer.setMode('ruler')
    GameContainer.map.on('onRulerPointCreated', this.onRulerPointCreated.bind(this))
    GameContainer.map.on('onRulerPointRemoved', this.onRulerPointRemoved.bind(this))
    GameContainer.map.on('onRulerPointsCleared', this.onRulerPointsCleared.bind(this))

    let userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

    if (userPlayer) {
      this.hyperspaceRange = userPlayer.research.hyperspace.effective
    }
  },
  destroyed () {
    // Set map to galaxy mode
    GameContainer.resetMode()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    resetRulerPoints () {
      // Bit hacky but it works.
      GameContainer.resetMode()
      GameContainer.setMode('ruler')
    },
    onRulerPointCreated (e) {
      this.points.push(e)

      this.recalculateETAs()
    },
    onRulerPointRemoved (e) {
      this.points.splice(this.points.indexOf(e), 1)

      this.recalculateETAs()
    },
    onRulerPointsCleared (e) {
      this.points = []

      this.recalculateETAs()
    },
    recalculateETAs () {
      let game = this.$store.state.game

      let totalTicks = GameHelper.getTicksBetweenLocations(game, null, this.points)
      let totalTicksWarp = GameHelper.getTicksBetweenLocations(game, null, this.points, game.constants.distances.warpSpeedMultiplier)

      let totalTimeString = GameHelper.getCountdownTimeStringByTicks(game, totalTicks, true)
      let totalTimeWarpString = GameHelper.getCountdownTimeStringByTicks(game, totalTicksWarp, true)

      this.totalEta = totalTimeString
      this.totalEtaWarp = totalTimeWarpString
    }
  }
}
</script>

<style scoped>
</style>
