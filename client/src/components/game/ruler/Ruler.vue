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

    <div class="row bg-primary pt-2 pb-2">
        <div class="col-6">
            Range
        </div>
        <div class="col-6 text-right">
            <i class="fas fa-sun"></i> {{rangeLightYears}} LY
        </div>
    </div>

    <div class="row bg-secondary pt-2 pb-2">
        <div class="col-6">
            Scanning Range
        </div>
        <div class="col-6 text-right">
            <i class="fas fa-binoculars"></i> {{scanningRange}}
        </div>
    </div>

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

export default {
  components: {
    'menu-title': MenuTitleVue
  },
  data () {
    return {
      points: [],
      etaTicks: 0,
      rangeLightYears: 0,
      hyperspaceRange: 0,
      scanningRange: 0,
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
      this.recalculateHyperspaceRange()
      this.recalculateRangeLightYears()
    },
    onRulerPointRemoved (e) {
      this.points.splice(this.points.indexOf(e), 1)

      this.recalculateETAs()
      this.recalculateHyperspaceRange()
      this.recalculateRangeLightYears()
    },
    onRulerPointsCleared (e) {
      this.points = []

      this.recalculateETAs()
      this.recalculateHyperspaceRange()
      this.recalculateRangeLightYears()
    },
    recalculateETAs () {
      let game = this.$store.state.game

      let totalTicks = GameHelper.getTicksBetweenLocations(game, null, this.points)
      let totalTicksWarp = GameHelper.getTicksBetweenLocations(game, null, this.points, game.constants.distances.warpSpeedMultiplier)

      let totalTimeString = GameHelper.getCountdownTimeStringByTicks(game, totalTicks, true)
      let totalTimeWarpString = GameHelper.getCountdownTimeStringByTicks(game, totalTicksWarp, true)

      this.totalEta = totalTimeString
      this.totalEtaWarp = totalTimeWarpString
    },
    recalculateHyperspaceRange () {
      if (this.points.length < 2) {
        this.hyperspaceRange = 0
        this.scanningRange = 0
        return
      }

      let game = this.$store.state.game

      // Get the waypoint that has the largest distance between the source and destination.
      let distances = []

      for (let i = 0; i < this.points.length - 1; i++) {
        const point = this.points[i]
        const nextPoint = this.points[i + 1]

        if (!nextPoint) {
          continue
        }

        distances.push(GameHelper.getDistanceBetweenLocations(point, nextPoint))
      }

      let longestWaypoint = Math.max(...distances)

      // Calculate the hyperspace range required for it.
      this.hyperspaceRange = GameHelper.getHyperspaceLevelByDistance(game, longestWaypoint)
      this.scanningRange = GameHelper.getScanningLevelByDistance(game, longestWaypoint)
    },
    recalculateRangeLightYears () {
      this.rangeLightYears = 0
      if (this.points.length < 2) {
        return
      }

      let game = this.$store.state.game

      for (let i = 0; i < this.points.length - 1; i++) {
        this.rangeLightYears += GameHelper.getDistanceBetweenLocations(this.points[i], this.points[i + 1])
      }
      this.rangeLightYears = Math.round(this.rangeLightYears / game.constants.distances.lightYear)
    }
  }
}
</script>

<style scoped>
</style>
