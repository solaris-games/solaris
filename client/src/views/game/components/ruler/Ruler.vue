<template>
<div class="menu-page container">

  <menu-title title="Ruler" @onCloseRequested="onCloseRequested">
       <button class="btn btn-sm btn-outline-primary" @click="resetRulerPoints"><i class="fas fa-undo"></i> Reset</button>
        <button class="btn btn-sm btn-outline-warning ms-1" @click="popRulerPoint" :disabled="points.length === 0"><i class="fas fa-undo"></i> Last</button>
    </menu-title>
    <div v-if="isCompactUIStyle">
    <div class="row pt-2 pb-2 bg-dark">
      <div class="col-3 text-left">
          <span title="Total number of waypoints plotted">
           <i class="fas fa-map-marker-alt"></i> {{points.length}}
          </span>
      </div>
      <div class="col-3 text-center">
          <span title="Total distance (ly)">
            <i class="fas fa-ruler"></i> {{distanceLightYears}}
          </span>
      </div>
      <div class="col-3 text-center">
          <span title="Required scanning evel">
            <i class="fas fa-binoculars"></i> {{scanningLevel}}
          </span>
      </div>
      <div class="col-3 text-end">
          <span title="Required hyperspace level">
            <i class="fas fa-gas-pump"></i> {{hyperspaceLevel}}
          </span>
      </div>
    </div>

    <div class="row bg-dark pt-2 pb-2 mt-1">
      <div class="col-2">
          ETA<orbital-mechanics-eta-warning />
      </div>
      <div class="col-5 text-end">
          <span title="ETA base speed">
            Base {{totalEta || 'N/A'}}
          </span>
      </div>
      <div class="col-5 text-end">
          <span title="ETA warp speed">
            Warp {{totalEtaWarp || 'N/A'}}
          </span>
      </div>
    </div>
  </div>

  <div class="row pt-2 pb-2 bg-dark mt-1">
    <div class="col-6">
    Speed Modifier
    </div>
    <div class="col-6 text-end">
      <select class="form-control form-control-sm" v-model="speedModifier" @change="onSpeedModifierChanged">
        <option value="1">1.0x (Normal)</option>
        <option v-for="speed in speeds" v-bind:key="speed" :value="speed">{{speed}}x</option>
      </select>
    </div>
  </div>

<div v-if="isStandardUIStyle">
  <div class="row bg-dark pt-2 pb-2">
          <div class="col-6">
              Waypoints
          </div>
          <div class="col-6 text-end">
              <span title="Total number of waypoints plotted">
                <i class="fas fa-map-marker-alt"></i> {{points.length}}
              </span>
          </div>
      </div>

      <div class="row pt-2 pb-2">
          <div class="col-6">
             Distance (ly)
          </div>
          <div class="col-6 text-end">
              <span title="Total distance (ly)">
                <i class="fas fa-ruler"></i> {{distanceLightYears}}
              </span>
          </div>
      </div>

      <div class="row bg-dark pt-2 pb-2">
          <div class="col-8">
              Required Scanning Level
          </div>
          <div class="col-4 text-end">
              <span title="Required scanning level">
                <i class="fas fa-binoculars"></i> {{scanningLevel}}
              </span>
          </div>
      </div>

      <div class="row pt-2 pb-2">
          <div class="col-8">
              Required Hyperspace Level
          </div>
          <div class="col-4 text-end">
              <span title="Required hyperspace level">
                <i class="fas fa-gas-pump"></i> {{hyperspaceLevel}}
              </span>
          </div>
      </div>

      <div class="row bg-dark pt-2 pb-2">
          <div class="col-6">
              ETA Base Speed
          </div>
          <div class="col-6 text-end">
              <span title="ETA base speed">
                {{totalEta || 'N/A'}}
              </span>
          </div>
      </div>

      <div class="row pt-2 pb-2">
          <div class="col-6">
              ETA Warp Speed
          </div>
          <div class="col-6 text-end">
              <span title="ETA warp speed">
                {{totalEtaWarp || 'N/A'}}
              </span>
          </div>
        </div>
    </div>

    <table class="table table-sm table-striped mb-2 mt-2" v-if="points.length > 1">
      <thead>
        <tr>
          <td>Start</td>
          <td></td>
          <td>End</td>
          <td>Distance (ly)</td>
          <td>Total</td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="point in points" :key="point.object._id">
          <template v-if="getNextPoint(point)">
            <td>
              <span>
                <i class="fas" :class="{'fa-star':point.type=='star','fa-rocket':point.type=='carrier'}"></i>
                {{point.object.name}}
              </span>
            </td>
            <td>
              <i v-if="getNextPoint(point)" class="fas fa-arrow-right ms-2 me-2"></i>
            </td>
            <td>
              <span v-if="getNextPoint(point)">
                <i class="fas" :class="{'fa-star':getNextPoint(point).type=='star','fa-rocket':getNextPoint(point).type=='carrier'}"></i>
                {{getNextPoint(point).object.name}}
              </span>
            </td>
            <td>
              <span v-if="getNextPoint(point)">{{getNextPointDistance(point)}}</span>
            </td>
            <td>
              <span>{{getDistanceRunningTotal(point)}}</span>
            </td>
          </template>
        </tr>
      </tbody>
    </table>

    <div class="row bg-dark" v-if="warpGateCost">
      <div class="col">
        <p class="mt-2 mb-2"><small>To build Warp Gates on the selected route will cost <span class="text-warning">${{warpGateCost}}</span>.</small></p>
      </div>
    </div>
</div>
</template>

<script>
import MenuTitleVue from '../MenuTitle.vue'
import GameContainer from '../../../../game/container'
import GameHelper from '../../../../services/gameHelper'
import OrbitalMechanicsETAWarningVue from '../shared/OrbitalMechanicsETAWarning.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'menu-title': MenuTitleVue,
    'orbital-mechanics-eta-warning': OrbitalMechanicsETAWarningVue
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
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
      isCompactUIStyle: false,
      speedModifier: 1
    }
  },
  mounted () {
    this.isStandardUIStyle = this.$store.state.settings.interface.uiStyle === 'standard'
    this.isCompactUIStyle = this.$store.state.settings.interface.uiStyle === 'compact'

    this.onRulerPointCreated = this.onRulerPointCreated.bind(this);
    this.eventBus.on('onRulerPointCreated', this.onRulerPointCreated);

    this.onRulerPointRemoved = this.onRulerPointRemoved.bind(this);
    this.eventBus.on('onRulerPointRemoved', this.onRulerPointRemoved);

    this.onRulerPointsCleared = this.onRulerPointsCleared.bind(this);
    this.eventBus.on('onRulerPointsCleared', this.onRulerPointsCleared);

    // Set map to ruler mode
    GameContainer.setMode('ruler')
  },
  unmounted () {
    this.eventBus.off('onRulerPointCreated', this.onRulerPointCreated);
    this.eventBus.off('onRulerPointRemoved', this.onRulerPointRemoved);
    this.eventBus.off('onRulerPointsCleared', this.onRulerPointsCleared);

    // Set map to galaxy mode
    GameContainer.resetMode()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    popRulerPoint () {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandRemoveLastRulerPoint, {});
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
        if (e.object.specialistId && e.object.specialist.modifiers && e.object.specialist.modifiers.local && e.object.specialist.modifiers.local.speed  ) {
          this.speedModifier = e.object.specialist.modifiers.local.speed
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

      let totalTicks = GameHelper.getTicksBetweenLocations(game, null, this.points, this.speedModifier)
      let totalTicksWarp = GameHelper.getTicksBetweenLocations(game, null, this.points, game.constants.distances.warpSpeedMultiplier * this.speedModifier)

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

      this.distanceLightYears = (Math.round(this.distanceLightYears / game.constants.distances.lightYear * 100.0) / 100.0).toFixed(2)
    },
    getNextPoint (point) {
      let i = this.points.indexOf(point)

      return this.points[i+1] || null
    },
    getNextPointDistance (point) {
      let i = this.points.indexOf(point)

      let distance = GameHelper.getDistanceBetweenLocations(this.points[i].location, this.points[i + 1].location)

      distance = Math.round(distance / this.$store.state.game.constants.distances.lightYear * 100.0) / 100.0

      return distance.toFixed(2)
    },
    getDistanceRunningTotal (point) {
      let index = this.points.indexOf(point)

      let distance = 0

      for (let i = 0; i < index + 1; i++) {
        if (this.points[i + 1]) {
          distance += GameHelper.getDistanceBetweenLocations(this.points[i].location, this.points[i + 1].location)
        }
      }

      distance = Math.round(distance / this.$store.state.game.constants.distances.lightYear * 100.0) / 100.0

      return distance.toFixed(2)
    }
  },
  computed: {
    warpGateCost () {
      const starPoints = this.points.filter(p => p.type === 'star' && !p.object.warpGate && p.object.upgradeCosts)
      const starIds = [...new Set(starPoints.map(p => p.object._id))]

      let sum = 0

      for (let starId of starIds) {
        sum += starPoints.find(p => p.object._id === starId).object.upgradeCosts.warpGate
      }

      return sum
    },
    speeds: function () {
      if (!this.$store.state.carrierSpecialists) {
        return [];
      }

      const speedSpecialists = this.$store.state.carrierSpecialists.filter(i => i.modifiers && i.modifiers.local && i.modifiers.local.speed)

      return [...new Set(speedSpecialists.map(s => s.modifiers.local.speed))].sort()
    }
  }
}
</script>

<style scoped>
</style>
