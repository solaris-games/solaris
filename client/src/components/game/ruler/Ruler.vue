<template>
<div class="menu-page container">
    <menu-title title="Ruler" @onCloseRequested="onCloseRequested">
        <button class="btn btn-sm btn-primary" @click="resetRulerPoints"><i class="fas fa-undo"></i> Reset</button>
    </menu-title>
    <div v-if="isCompactUIStyle">
    <div class="row bg-primary pt-2 pb-2">
      <div class="col-3 text-left">
          <span title="Waypoints">
           <i class="fas fa-map-marker-alt"></i> {{points.length}}
          </span>
      </div>
      <div class="col-3 text-center">
          <span title="Distance (ly)">
            <i class="fas fa-sun"></i> {{distanceLightYears.toFixed(3)}}
          </span>
      </div>
      <div class="col-3 text-center">
          <span title="Required Scanning Level">
            <i class="fas fa-binoculars"></i> {{scanningLevel}}
          </span>
      </div>
      <div class="col-3 text-right">
          <span title="Required Hyperspace Level">
            <i class="fas fa-gas-pump"></i> {{hyperspaceLevel}}
          </span>
      </div>
    </div>

    <div class="row bg-secondary pt-2 pb-2">
      <div class="col-2">
          ETA
      </div>
      <div class="col-5 text-right">
          <span title="ETA Base Speed">
            Base {{totalEta || 'N/A'}}
          </span>
      </div>
      <div class="col-5 text-right">
          <span title="ETA Warp Speed">
            Warp {{totalEtaWarp || 'N/A'}}
          </span>
      </div>
    </div>
    </div>

    <div v-if="isStandardUIStyle">
      <div class="row bg-secondary pt-2 pb-2">
          <div class="col-6">
              Waypoints
          </div>
          <div class="col-6 text-right">
              <span title="Waypoints">
                <i class="fas fa-map-marker-alt"></i> {{points.length}}
              </span>
          </div>
      </div>

      <div class="row bg-primary pt-2 pb-2">
          <div class="col-6">
             Distance (ly)
          </div>
          <div class="col-6 text-right">
              <span title="Distance (ly)">
                <i class="fas fa-sun"></i> {{distanceLightYears}}
              </span>
          </div>
      </div>

      <div class="row bg-secondary pt-2 pb-2">
          <div class="col-8">
              Required Scanning Level
          </div>
          <div class="col-4 text-right">
              <span title="Required Scanning Level">
                <i class="fas fa-binoculars"></i> {{scanningLevel}}
              </span>
          </div>
      </div>

      <div class="row bg-primary pt-2 pb-2">
          <div class="col-8">
              Required Hyperspace Level
          </div>
          <div class="col-4 text-right">
              <span title="Required Hyperspace Level">
                <i class="fas fa-gas-pump"></i> {{hyperspaceLevel}}
              </span>
          </div>
      </div>

      <div class="row bg-secondary pt-2 pb-2">
          <div class="col-6">
              ETA Base Speed
          </div>
          <div class="col-6 text-right">
              <span title="ETA Base Speed">
                {{totalEta || 'N/A'}}
              </span>
          </div>
      </div>

      <div class="row bg-primary pt-2 pb-2">
          <div class="col-6">
              ETA Warp Speed
          </div>
          <div class="col-6 text-right">
              <span title="ETA Warp Speed">
                {{totalEtaWarp || 'N/A'}}
              </span>
          </div>
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
      distanceLightYears: 0,
      hyperspaceLevel: 0,
      scanningLevel: 0,
      totalEta: '',
      totalEtaWarp: '',
      isStandardUIStyle: false,
      isCompactUIStyle: false
    }
  },
  mounted () {
    this.isStandardUIStyle = this.$store.state.settings.interface.uiStyle === 'standard'
    this.isCompactUIStyle = this.$store.state.settings.interface.uiStyle === 'compact'

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
      this.recalculateHyperspaceScanningLevel()
      this.recalculateDistanceLightYears()
    },
    onRulerPointRemoved (e) {
      this.points.splice(this.points.indexOf(e), 1)

      this.recalculateETAs()
      this.recalculateHyperspaceScanningLevel()
      this.recalculateDistanceLightYears()
    },
    onRulerPointsCleared (e) {
      this.points = []

      this.recalculateETAs()
      this.recalculateHyperspaceScanningLevel()
      this.recalculateDistanceLightYears()
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
    recalculateHyperspaceScanningLevel () {
      if (this.points.length < 2) {
        this.hyperspaceLevel = 0
        this.scanningLevel = 0
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
      this.hyperspaceLevel = GameHelper.getHyperspaceLevelByDistance(game, longestWaypoint)
      this.scanningLevel = GameHelper.getScanningLevelByDistance(game, longestWaypoint)
    },
    recalculateDistanceLightYears () {
      this.distanceLightYears = 0
      if (this.points.length < 2) {
        return
      }

      let game = this.$store.state.game

      for (let i = 0; i < this.points.length - 1; i++) {
        this.distanceLightYears += GameHelper.getDistanceBetweenLocations(this.points[i], this.points[i + 1])
      }
      this.distanceLightYears = Math.round(this.distanceLightYears / game.constants.distances.lightYear * 100.0) / 100.0
    }
  }
}
</script>

<style scoped>
</style>
