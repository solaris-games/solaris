<template>
<div class="menu-page container">

  <menu-title title="Ruler" @onCloseRequested="onCloseRequested">
       <button class="btn btn-sm btn-primary" @click="resetRulerPoints"><i class="fas fa-undo"></i> Reset</button>
        <button class="btn btn-sm btn-warning ml-1" @click="popRulerPoint" :disabled="points.length === 0"><i class="fas fa-undo"></i> Last</button>
    </menu-title>
    <div v-if="isCompactUIStyle">
    <div class="row bg-primary pt-2 pb-2">
      <div class="col-3 text-left">
          <span title="Total number of waypoints plotted">
           <i class="fas fa-map-marker-alt"></i> {{points.length}}
          </span>
      </div>
      <div class="col-3 text-center">
          <span title="Total distance (ly)">
            <i class="fas fa-sun"></i> {{distanceLightYears.toFixed(3)}}
          </span>
      </div>
      <div class="col-3 text-center">
          <span title="Required scanning evel">
            <i class="fas fa-binoculars"></i> {{scanningLevel}}
          </span>
      </div>
      <div class="col-3 text-right">
          <span title="Required hyperspace level">
            <i class="fas fa-gas-pump"></i> {{hyperspaceLevel}}
          </span>
      </div>
    </div>

    <div class="row bg-secondary pt-2 pb-2">
      <div class="col-2">
          ETA<orbital-mechanics-eta-warning />
      </div>
      <div class="col-5 text-right">
          <span title="ETA base speed">
            Base {{totalEta || 'N/A'}}
          </span>
      </div>
      <div class="col-5 text-right">
          <span title="ETA warp speed">
            Warp {{totalEtaWarp || 'N/A'}}
          </span>
      </div>
    </div>
    <div class="row bg-primary pt-2 pb-2">
      <div class="col-6">
      Speed Mod.
      </div>
      <div class="col-6 text-right">
        <select class="form-control form-control-sm" v-model="speedModifier" @change="onSpeedModifierChanged">
          <option value="1">Normal (1.0x)</option>
          <option value="0.5">0.5x</option>
          <option value="1.5">1.5x</option>
          <option value="2.0">2.0x</option>
        </select>
      </div>
    </div>
  </div>
<div v-if="isStandardUIStyle">
  <div class="row bg-primary pt-2 pb-2">
    <div class="col-6">
       Speed Modifier
    </div>
    <div class="col-6 text-right">
    <select class="form-control form-control-sm" v-model="speedModifier" @change="onSpeedModifierChanged">
      <option value="1">Normal (1.0x)</option>
      <option value="0.5">0.5x</option>
      <option value="1.5">1.5x</option>
      <option value="2.0">2.0x</option>
    </select>
    </div>
  </div>
  <div class="row bg-secondary pt-2 pb-2">
          <div class="col-6">
              Waypoints
          </div>
          <div class="col-6 text-right">
              <span title="Total number of waypoints plotted">
                <i class="fas fa-map-marker-alt"></i> {{points.length}}
              </span>
          </div>
      </div>

      <div class="row bg-primary pt-2 pb-2">
          <div class="col-6">
             Distance (ly)
          </div>
          <div class="col-6 text-right">
              <span title="Total distance (ly)">
                <i class="fas fa-sun"></i> {{distanceLightYears}}
              </span>
          </div>
      </div>

      <div class="row bg-secondary pt-2 pb-2">
          <div class="col-8">
              Required Scanning Level
          </div>
          <div class="col-4 text-right">
              <span title="Required scanning level">
                <i class="fas fa-binoculars"></i> {{scanningLevel}}
              </span>
          </div>
      </div>

      <div class="row bg-primary pt-2 pb-2">
          <div class="col-8">
              Required Hyperspace Level
          </div>
          <div class="col-4 text-right">
              <span title="Required hyperspace level">
                <i class="fas fa-gas-pump"></i> {{hyperspaceLevel}}
              </span>
          </div>
      </div>

      <div class="row bg-secondary pt-2 pb-2">
          <div class="col-6">
              ETA Base Speed
          </div>
          <div class="col-6 text-right">
              <span title="ETA base speed">
                {{totalEta || 'N/A'}}
              </span>
          </div>
      </div>

      <div class="row bg-primary pt-2 pb-2">
          <div class="col-6">
              ETA Warp Speed
          </div>
          <div class="col-6 text-right">
              <span title="ETA warp speed">
                {{totalEtaWarp || 'N/A'}}
              </span>
          </div>
        </div>
    </div>

    <div class="row bg-dark" v-if="warpGateCost">
      <div class="col">
        <p class="mt-2 mb-2"><small>To build Warp Gates on the selected route will cost <span class="text-warning">${{warpGateCost}}</span>.</small></p>
      </div>
    </div>
</div>
</template>

<script>
import MenuTitleVue from '../MenuTitle'
import GameContainer from '../../../game/container'
import GameHelper from '../../../services/gameHelper'
import OrbitalMechanicsETAWarningVue from '../shared/OrbitalMechanicsETAWarning'
import SpecialistService from '../../../services/api/specialist'

export default {
  components: {
    'menu-title': MenuTitleVue,
    'orbital-mechanics-eta-warning': OrbitalMechanicsETAWarningVue
  },
  data () {
    return {
      isLoading: false,
      carrierSpecialists: [],
      points: [],
      etaTicks: 0,
      distanceLightYears: 0,
      hyperspaceLevel: 0,
      scanningLevel: 0,
      totalEta: '',
      totalEtaWarp: '',
      isStandardUIStyle: false,
      isCompactUIStyle: false,
      speedModifier: 1
    }
  },
  async mounted () {
    await this.loadSpecialists()
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
    async loadSpecialists () {
      this.isLoading = true
      let requests = [ SpecialistService.getCarrierSpecialists( this.$store.state.game._id ) ]

      const responses = await Promise.all(requests)

      this.carrierSpecialists = responses[0].data
      this.isLoading = false
    },
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    popRulerPoint () {
      GameContainer.map.removeLastRulerPoint()
    },
    resetRulerPoints () {
      // Bit hacky but it works.
      GameContainer.resetMode()
      GameContainer.setMode('ruler')
    },
    onRulerPointCreated (e) {
      this.points.push(e)
      if (e.type == 'carrier' && this.points.length == 1) {
        this.speedModifier = 1;
        if (e.object.specialistId ) {
          for (let i = 0; i < this.carrierSpecialists.length - 1; i++) {
            if ( this.carrierSpecialists[i].id == e.object.specialistId  && this.carrierSpecialists[i].modifiers.local.speed ) {
              this.speedModifier = this.carrierSpecialists[i].modifiers.local.speed
              break
            }
          }
        }
      }
      this.recalculateAll()
    },
    onRulerPointRemoved (e) {
      this.points.splice(this.points.indexOf(e), 1)

      this.recalculateAll()
    },
    onRulerPointsCleared (e) {
      this.points = []

      this.recalculateAll()
    },
    onSpeedModifierChanged (e) {
      if (this.points.length > 1) {
        this.recalculateETAs()
      }
    },
    recalculateAll () {
      this.recalculateETAs()
      this.recalculateHyperspaceScanningLevel()
      this.recalculateDistanceLightYears()
    },
    recalculateETAs () {
      let game = this.$store.state.game
      let locations = this.points.map(p => p.location)

      let totalTicks = GameHelper.getTicksBetweenLocations(game, null, locations, this.speedModifier)
      let totalTicksWarp = GameHelper.getTicksBetweenLocations(game, null, locations, game.constants.distances.warpSpeedMultiplier * this.speedModifier)

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

        distances.push(GameHelper.getDistanceBetweenLocations(point.location, nextPoint.location))
      }

      let longestWaypoint = Math.max(...distances)

      // Calculate the hyperspace range required for it.
      this.hyperspaceLevel = Math.max(GameHelper.getHyperspaceLevelByDistance(game, longestWaypoint), 1)
      this.scanningLevel = GameHelper.getScanningLevelByDistance(game, longestWaypoint)
    },
    recalculateDistanceLightYears () {
      this.distanceLightYears = 0
      if (this.points.length < 2) {
        return
      }

      let game = this.$store.state.game

      for (let i = 0; i < this.points.length - 1; i++) {
        this.distanceLightYears += GameHelper.getDistanceBetweenLocations(this.points[i].location, this.points[i + 1].location)
      }
      this.distanceLightYears = Math.round(this.distanceLightYears / game.constants.distances.lightYear * 100.0) / 100.0
    }
  },
  computed: {
    warpGateCost () {
      let starPoints = this.points.filter(p => p.type === 'star' && !p.object.warpGate && p.object.upgradeCosts)
      let starIds = [...new Set(starPoints.map(p => p.object._id))]

      let sum = 0

      for (let starId of starIds) {
        sum += starPoints.find(p => p.object._id === starId).object.upgradeCosts.warpGate
      }

      return sum
    }
  }
}
</script>

<style scoped>
</style>
