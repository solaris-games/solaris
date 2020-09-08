<template>
<div class="menu-page container">
    <menu-title title="Ruler" @onCloseRequested="onCloseRequested">
        <button class="btn btn-primary" @click="resetRulerPoints">Reset</button>
    </menu-title>

    <div class="row bg-secondary pt-2 pb-2">
        <div class="col-6">
            Waypoints
        </div>
        <div class="col-6 text-right">
            {{points.length}}
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
            {{hyperspaceRange}}
        </div>
    </div>

    <div class="row bg-secondary pt-2 pb-2">
        <div class="col-6">
            ETA Base Speed
        </div>
        <div class="col-6 text-right">
            {{totalEta}}
        </div>
    </div>

    <div class="row bg-primary pt-2 pb-2">
        <div class="col-6">
            ETA Warp Speed
        </div>
        <div class="col-6 text-right">
            {{totalEtaWarp}}
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
      this.hyperspaceRange = userPlayer.research.hyperspace.level
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
      let totalTicksWarp = GameHelper.getTicksBetweenLocations(game, null, this.points, 3) // TODO: Need a constant here.

      let totalTime = GameHelper.calculateTimeByTicks(totalTicks, game.settings.gameTime.speed, moment().utc())
      let totalTimeString = GameHelper.getCountdownTimeString(game, totalTime)

      let totalTimeWarp = GameHelper.calculateTimeByTicks(totalTicksWarp, game.settings.gameTime.speed, moment().utc())
      let totalTimeWarpString = GameHelper.getCountdownTimeString(game, totalTimeWarp)

      this.totalEta = totalTimeString
      this.totalEtaWarp = totalTimeWarpString
    }
  }
}
</script>

<style scoped>
</style>
