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
          ETA<orbital-mechanics-e-t-a-warning />
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

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue';
import MenuTitle from '../MenuTitle.vue'
import GameHelper from '../../../../services/gameHelper'
import OrbitalMechanicsETAWarning from '../shared/OrbitalMechanicsETAWarning.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapEventBusEventNames from "@/eventBusEventNames/map";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {ModeKind} from "@/game/map";
import { useStore } from 'vuex';
import type {Carrier, Game, Star} from "@/types/game";
import type {RulerPoint} from "@/types/ruler";
import {getCountdownTimeStringByTicks} from "@/util/time";
import type {Specialist} from "@solaris-common";

const emit = defineEmits<{
  onCloseRequested: [],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);

const points = ref<RulerPoint[]>([]);
const distanceLightYears = ref(0);
const hyperspaceLevel = ref(0);
const scanningLevel = ref(0);
const totalEta = ref('');
const totalEtaWarp = ref('');
const speedModifier = ref(1);

const isCompactUIStyle = computed(() => store.state.settings.interface.uiStyle === 'compact');
const isStandardUIStyle = computed(() => !isCompactUIStyle.value);

const warpGateCost = computed(() => {
  const starPoints = points.value.filter(p => p.type === 'star' && !(p.object as Star).warpGate && (p.object as Star).upgradeCosts)
  const starIds = [...new Set(starPoints.map(p => p.object._id))]

  let sum = 0;

  for (let starId of starIds) {
    const star = starPoints.find(p => p.object._id === starId)!.object as Star;
    sum += star.upgradeCosts?.warpGate || 0;
  }

  return sum;
});

const carrierSpecialists = computed<Specialist[]>(() => store.state.carrierSpecialists);

const speeds = computed(() => {
  if (!carrierSpecialists.value) {
    return [];
  }

  const speedSpecialists = carrierSpecialists.value.filter(i => i.modifiers && i.modifiers.local && i.modifiers.local.speed);

  return [...new Set(speedSpecialists.map(s => s.modifiers!.local!.speed))].sort()
});

const onCloseRequested = () => {
  emit('onCloseRequested');
};

const recalculateETAs = () => {
  const totalTicks = GameHelper.getTicksBetweenLocations(game.value, null, points.value, speedModifier.value)
  const totalTicksWarp = GameHelper.getTicksBetweenLocations(game.value, null, points.value, game.value.constants.distances.warpSpeedMultiplier * speedModifier.value)

  totalEta.value = getCountdownTimeStringByTicks(game.value, totalTicks)
  totalEtaWarp.value = getCountdownTimeStringByTicks(game.value, totalTicksWarp)
};

const recalculateHyperspaceScanningLevel = () => {
  if (points.value.length < 2) {
    hyperspaceLevel.value = 0
    scanningLevel.value = 0
    return
  }

  // Get the waypoint that has the largest distance between the source and destination.
  const distances: number[] = []

  for (let i = 0; i < points.value.length - 1; i++) {
    const point = points.value[i]
    const nextPoint = points.value[i + 1]

    if (!nextPoint) {
      continue
    }

    distances.push(GameHelper.getDistanceBetweenLocations(point.location, nextPoint.location))
  }

  const longestWaypoint = Math.max(...distances)

  // Calculate the hyperspace range required for it.
  hyperspaceLevel.value = Math.max(GameHelper.getHyperspaceLevelByDistance(game.value, longestWaypoint), 1)
  scanningLevel.value = GameHelper.getScanningLevelByDistance(game.value, longestWaypoint)
};

const recalculateDistanceLightYears = () => {
  distanceLightYears.value = 0

  if (points.value.length < 2) {
    return;
  }

  for (let i = 0; i < points.value.length - 1; i++) {
    distanceLightYears.value += GameHelper.getDistanceBetweenLocations(points.value[i].location, points.value[i + 1].location)
  }

  distanceLightYears.value = Math.round(distanceLightYears.value / game.value.constants.distances.lightYear * 100.0) / 100.0
};

const recalculateAll = () => {
  recalculateETAs();
  recalculateHyperspaceScanningLevel();
  recalculateDistanceLightYears();
};

const onRulerPointCreated = ({ rulerPoint: e }: { rulerPoint: RulerPoint }) => {
  points.value.push(e);

  if (e.type == 'carrier' && points.value.length == 1) {
    speedModifier.value = 1;

    const carrier = e.object as Carrier;

    if (carrier.specialistId && carrier.specialist!.modifiers && carrier.specialist!.modifiers.local && carrier.specialist!.modifiers.local.speed) {
      speedModifier.value = carrier.specialist!.modifiers.local.speed;
    }
  }

  recalculateAll();
};

const onRulerPointRemoved = ({ rulerPoint: e }: { rulerPoint: RulerPoint }) => {
  points.value.splice(points.value.indexOf(e), 1);

  recalculateAll();
};

const onRulerPointsCleared = () => {
  points.value = [];

  recalculateAll();
};

const resetRulerPoints = () => {
  // Bit hacky but it works.
  eventBus.emit(MapCommandEventBusEventNames.MapCommandResetMode, {});
  eventBus.emit(MapCommandEventBusEventNames.MapCommandSetMode, {
    mode: ModeKind.Ruler,
  });
};

const popRulerPoint = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandRemoveLastRulerPoint, {});
};

const getNextPoint = (point: RulerPoint) => {
  const i = points.value.indexOf(point);

  return points.value[i+1] || null;
};

const getNextPointDistance = (point: RulerPoint) => {
  const i = points.value.indexOf(point);

  let distance = GameHelper.getDistanceBetweenLocations(points.value[i].location, points.value[i + 1].location)

  distance = Math.round(distance / game.value.constants.distances.lightYear * 100.0) / 100.0

  return distance.toFixed(2)
};

const getDistanceRunningTotal = (point: RulerPoint) => {
  let index = points.value.indexOf(point)

  let distance = 0

  for (let i = 0; i < index + 1; i++) {
    if (points.value[i + 1]) {
      distance += GameHelper.getDistanceBetweenLocations(points.value[i].location, points.value[i + 1].location)
    }
  }

  distance = Math.round(distance / game.value.constants.distances.lightYear * 100.0) / 100.0

  return distance.toFixed(2)
};

const onSpeedModifierChanged = () => {
  if (points.value.length > 1) {
    recalculateAll()
  }
};

onMounted(() => {
  eventBus.on(MapEventBusEventNames.MapOnRulerPointCreated, onRulerPointCreated);
  eventBus.on(MapEventBusEventNames.MapOnRulerPointRemoved, onRulerPointRemoved);
  eventBus.on(MapEventBusEventNames.MapOnRulerPointsCleared, onRulerPointsCleared);

  eventBus.emit(MapCommandEventBusEventNames.MapCommandSetMode, {
    mode: ModeKind.Ruler,
  });

  onUnmounted(() => {
    eventBus.off(MapEventBusEventNames.MapOnRulerPointCreated, onRulerPointCreated);
    eventBus.off(MapEventBusEventNames.MapOnRulerPointRemoved, onRulerPointRemoved);
    eventBus.off(MapEventBusEventNames.MapOnRulerPointsCleared, onRulerPointsCleared);

    // Set map to galaxy mode
    eventBus.emit(MapCommandEventBusEventNames.MapCommandResetMode, {});
  });
});
</script>

<style scoped>
</style>
