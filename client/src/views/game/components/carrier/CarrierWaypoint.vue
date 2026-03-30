<template>
  <div class="menu-page container" v-if="carrier">
    <menu-title title="Edit Fleet Order" @onCloseRequested="onCloseRequested"/>

    <div class="row g-0">
      <table class="table table-borderless">
        <thead>
        <tr>
          <th scope="col" class="waypoint-table-head col-2">Delay</th>
          <th scope="col" class="waypoint-table-head col-2">Destination</th>
          <th scope="col" class="waypoint-table-head col-6">Action</th>
          <th scope="col" class="waypoint-table-head col-2">
            <span
              v-if="!currentWaypoint || !currentWaypoint.action || !isActionRequiresPercentage(currentWaypoint.action)">Ships</span>
            <span
              v-if="currentWaypoint && currentWaypoint.action && isActionRequiresPercentage(currentWaypoint.action)">%</span>
          </th>
        </tr>
        </thead>
        <tbody>
        <waypoint-edit-row :isInTransit="isInTransit" :waypoint="currentWaypoint" :allWaypoints="waypoints"
                           @change="recalculateWaypointDuration"/>
        </tbody>
      </table>
    </div>


    <div class="row pt-1 pb-0 mb-0">
      <div class="col">
        <p class="mb-2">ETA
          <orbital-mechanics-e-t-a-warning/>
          : {{ waypointEta }}
        </p>
      </div>
      <div class="col-auto" v-if="isRealTimeGame">
        <p class="mb-2">Duration
          <orbital-mechanics-e-t-a-warning/>
          : {{ waypointDuration }}
        </p>
      </div>
    </div>

    <div class="row bg-dark pt-2 pb-2">
      <div class="col pe-0">
        <button class="btn btn-sm btn-primary" @click="previousWaypoint()" :disabled="isSavingWaypoints">
          <i class="fas fa-chevron-left"></i>
          <span class="ms-1">Prev</span>
        </button>
        <button class="btn btn-sm btn-primary ms-1" @click="nextWaypoint()" :disabled="isSavingWaypoints">
          <span class="me-1">Next</span>
          <i class="fas fa-chevron-right"></i>
        </button>
        <button class="btn btn-sm ms-1"
                :class="{'btn-success':carrier.waypointsLooped,'btn-outline-primary':!carrier.waypointsLooped}"
                @click="toggleLooped()" :disabled="isHistoricalMode || !canLoop"
                title="Loop/Unloop the carrier's waypoints">
          <i class="fas fa-sync"></i>
        </button>
      </div>
      <div class="col-auto" v-if="!isHistoricalMode">
        <button class="btn btn-sm btn-outline-success" @click="doSaveWaypoints()" :disabled="isSavingWaypoints">
          <i class="fas fa-save"></i>
          <span class="ms-1">Save</span>
        </button>
        <button class="btn btn-sm btn-success ms-1" @click="doSaveWaypoints(true)" :disabled="isSavingWaypoints">
          <i class="fas fa-check"></i>
          <span class="ms-1 d-none d-sm-inline-block">Save &amp; Edit</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, onMounted, onUnmounted, ref, watch} from 'vue';
import MenuTitle from '../MenuTitle.vue';
import GameHelper from '../../../../services/gameHelper';
import gameHelper from '../../../../services/gameHelper';
import OrbitalMechanicsETAWarning from '../shared/OrbitalMechanicsETAWarning.vue';
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "../../../../eventBusEventNames/mapCommand";
import type {CarrierWaypoint, CarrierWaypointActionType, MapObject, UserGameSettings} from "@solaris-common"
import {httpInjectionKey} from "@/services/typedapi";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import type {Game} from "@/types/game";
import {getCountdownTimeStringByTicks, ticksToDuration} from "@/util/time";
import {formatDuration} from "@/util/duration";
import {isActionRequiresShips} from "@/util/waypoint";
import WaypointEditRow from "@/views/game/components/carrier/WaypointEditRow.vue";
import {saveWaypoints} from "@/views/game/components/carrier/action";

const props = defineProps<{
  carrierId: string,
  waypoint: CarrierWaypoint<string>,
}>();

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenCarrierDetailRequested: [carrierId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useGameStore();
const isHistoricalMode = useIsHistoricalMode(store);

const settings = computed<UserGameSettings>(() => store.settings);
const game = computed<Game>(() => store.game!);
const carrier = computed(() => GameHelper.getCarrierById(game.value, props.carrierId)!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const isInTransit = computed(() => !carrier.value.orbiting);
const canLoop = computed(() => GameHelper.canLoop(game.value, userPlayer.value, carrier.value));
const isRealTimeGame = computed(() => GameHelper.isRealTimeGame(game.value));

const waypoints = ref<CarrierWaypoint<string>[]>(JSON.parse(JSON.stringify(carrier.value.waypoints)));
const currentWaypoint = ref<CarrierWaypoint<string>>(waypoints.value.find(x => x._id === props.waypoint._id)!);

const isSavingWaypoints = ref(false);
const waypointDuration = ref<string | null>(null);
const waypointEta = ref<string | null>(null);
const intervalFunction = ref<number | null>(null);

const onCloseRequested = () => {
  emit('onCloseRequested');
};

const panToWaypoint = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandClearHighlightedLocations, {});

  if (!currentWaypoint.value) {
    return;
  }

  const star = gameHelper.getStarById(game.value, currentWaypoint.value!.destination);

  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, {object: star as MapObject<string>});
  eventBus.emit(MapCommandEventBusEventNames.MapCommandHighlightLocation, {location: star!.location});
};

const isActionRequiresPercentage = (action: CarrierWaypointActionType) => {
  return action === 'dropPercentage' || action === 'collectPercentage';
};

const recalculateWaypointEta = () => {
  // Calculate the ticks + delay up to and including the current waypoint.
  let index = waypoints.value.indexOf(currentWaypoint.value);
  let totalTicks = 0;

  for (let i = 0; i <= index; i++) {
    const wp = waypoints.value[i];

    // wp.ticks includes delayTicks
    totalTicks += wp.ticks!;
  }

  waypointEta.value = getCountdownTimeStringByTicks(game.value, totalTicks);
};

const recalculateWaypointDuration = () => {
  if (currentWaypoint.value) {
    waypointDuration.value = formatDuration(ticksToDuration(game.value, (currentWaypoint.value.ticks || 0) + currentWaypoint.value.delayTicks));
  }

  recalculateWaypointEta();
};

const nextWaypoint = () => {
  let index = waypoints.value.indexOf(currentWaypoint.value);

  index++

  if (index > waypoints.value.length - 1) {
    index = 0
  }

  currentWaypoint.value = waypoints.value[index];
  recalculateWaypointDuration();
  panToWaypoint();
};

const previousWaypoint = () => {
  let index = waypoints.value.indexOf(currentWaypoint.value);

  index--;

  if (index < 0) {
    index = waypoints.value.length - 1;
  }

  currentWaypoint.value = waypoints.value[index];
  recalculateWaypointDuration();
  panToWaypoint();
};

const toggleLooped = () => {
  carrier.value.waypointsLooped = !carrier.value.waypointsLooped;
};

const waypointsSaveAction = saveWaypoints(game, isSavingWaypoints);

const doSaveWaypoints = async (saveAndEdit = false) => {
  const res = await waypointsSaveAction(carrier.value, waypoints.value);

  if (res) {
    if (saveAndEdit) {
      emit('onOpenCarrierDetailRequested', carrier.value._id);
    } else {
      onCloseRequested();
    }
  }
};

watch(() => currentWaypoint.value.action, (newV, oldV) => {
  if (!isActionRequiresShips(oldV) && isActionRequiresShips(newV)) {
    currentWaypoint.value.actionShips = settings.value.carrier.defaultAmount;
  } else if (!isActionRequiresShips(newV)) {
    currentWaypoint.value.actionShips = 0;
  }
})

onMounted(() => {
  recalculateWaypointDuration();
  recalculateWaypointEta();
  panToWaypoint();

  if (GameHelper.isGameInProgress(game.value) || GameHelper.isGamePendingStart(game.value)) {
    intervalFunction.value = setInterval(recalculateWaypointEta, 250);
    recalculateWaypointEta();
  }

  onUnmounted(() => {
    if (intervalFunction.value) {
      clearInterval(intervalFunction.value);
    }

    eventBus.emit(MapCommandEventBusEventNames.MapCommandClearHighlightedLocations, {});
  });
});
</script>

<style scoped>
.waypoint-table-head {
  padding: 1px;
  text-align: center;
}
</style>
