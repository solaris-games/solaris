<template>
	<div class="menu-page container" v-if="carrier">
    	<menu-title title="Edit Fleet Order" @onCloseRequested="onCloseRequested"/>

        <div class="row g-0 mb-1">
            <div class="col-2 text-center">
                <span>Delay</span>
            </div>
            <div class="col-3 text-center">
                <span>Destination</span>
            </div>
            <div class="col-5 text-center">
                <span>Action</span>
            </div>
            <div class="col-2 text-center">
                <span v-if="!currentWaypoint || !currentWaypoint.action || !isActionRequiresPercentage(currentWaypoint.action)">Ships</span>
                <span v-if="currentWaypoint && currentWaypoint.action && isActionRequiresPercentage(currentWaypoint.action)">%</span>
            </div>
        </div>

        <div class="row g-0 mb-2" v-if="currentWaypoint">
            <div class="col-2 text-center">
              <input type="number" class="form-control input-sm" v-if="!(isFirstWaypoint(currentWaypoint) && isInTransit)" v-model="currentWaypoint.delayTicks" @change="recalculateWaypointDuration">
            </div>
            <div class="col-3 text-center pt-1">
                <!-- <a href="javascript:;" @click="onOpenStarDetailRequested">{{getStarName(currentWaypoint.destination)}}</a> -->
                <span>{{getStarName(currentWaypoint.destination)}}</span>
            </div>
            <div class="col-5 text-center">
                <select class="form-control input-sm" id="waypointAction" v-model="currentWaypoint.action">
                    <option key="nothing" value="nothing">{{getWaypointActionFriendlyText(currentWaypoint, 'nothing')}}</option>
                    <option key="collectAll" value="collectAll">{{getWaypointActionFriendlyText(currentWaypoint, 'collectAll')}}</option>
                    <option key="dropAll" value="dropAll">{{getWaypointActionFriendlyText(currentWaypoint, 'dropAll')}}</option>
                    <option key="collect" value="collect">{{getWaypointActionFriendlyText(currentWaypoint, 'collect')}}</option>
                    <option key="drop" value="drop">{{getWaypointActionFriendlyText(currentWaypoint, 'drop')}}</option>
                    <option key="collectAllBut" value="collectAllBut">{{getWaypointActionFriendlyText(currentWaypoint, 'collectAllBut')}}</option>
                    <option key="dropAllBut" value="dropAllBut">{{getWaypointActionFriendlyText(currentWaypoint, 'dropAllBut')}}</option>
                    <option key="garrison" value="garrison">{{getWaypointActionFriendlyText(currentWaypoint, 'garrison')}}</option>
                    <option key="collectPercentage" value="collectPercentage">{{getWaypointActionFriendlyText(currentWaypoint, 'collectPercentage')}}</option>
                    <option key="dropPercentage" value="dropPercentage">{{getWaypointActionFriendlyText(currentWaypoint, 'dropPercentage')}}</option>
                </select>
            </div>
            <div class="col-2 text-center">
                <input v-if="isActionRequiresShips(currentWaypoint.action)" class="form-control input-sm" type="number" v-model="currentWaypoint.actionShips"/>
            </div>
        </div>

        <div class="row pt-2 pb-0 mb-0">
          <div class="col">
            <p class="mb-2">ETA<orbital-mechanics-e-t-a-warning />: {{waypointEta}}</p>
          </div>
          <div class="col-auto" v-if="isRealTimeGame">
            <p class="mb-2">Duration<orbital-mechanics-e-t-a-warning />: {{waypointDuration}}</p>
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
				<button class="btn btn-sm ms-1" :class="{'btn-success':carrier.waypointsLooped,'btn-outline-primary':!carrier.waypointsLooped}" @click="toggleLooped()" :disabled="isHistoricalMode || !canLoop" title="Loop/Unloop the carrier's waypoints">
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
import { inject, ref, computed, onMounted, onUnmounted } from 'vue';
import MenuTitle from '../MenuTitle.vue';
import GameHelper from '../../../../services/gameHelper';
import AudioService from '../../../../game/audio';
import OrbitalMechanicsETAWarning from '../shared/OrbitalMechanicsETAWarning.vue';
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "../../../../eventBusEventNames/mapCommand";
import gameHelper from "../../../../services/gameHelper";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import type {CarrierWaypoint, CarrierWaypointActionType, MapObject} from "@solaris-common"
import { useStore } from 'vuex';
import {saveWaypoints} from "@/services/typedapi/carrier";
import {httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

const props = defineProps<{
  carrierId: string,
  waypoint: CarrierWaypoint<string>,
}>();

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenStarDetailRequested: [starId: string],
  onOpenCarrierDetailRequested: [carrierId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const isHistoricalMode = useIsHistoricalMode(store);

const game = computed(() => store.state.game);
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

const onOpenStarDetailRequested = () => {
  if (currentWaypoint.value) {
    emit('onOpenStarDetailRequested', currentWaypoint.value.destination);
  }
};

const getStarName = (starId: string) => {
  const star = GameHelper.getStarById(game.value, starId);
  return star ? star.name : 'Unknown Star';
};

const panToWaypoint = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandClearHighlightedLocations, {});

  if (!currentWaypoint.value) {
    return;
  }

  const star = gameHelper.getStarById(game.value, currentWaypoint.value!.destination);

  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star as MapObject<string> });
  eventBus.emit(MapCommandEventBusEventNames.MapCommandHighlightLocation, { location: star!.location });
};

const isActionRequiresShips = (action: CarrierWaypointActionType) => {
  switch (action) {
    case 'collect':
    case 'drop':
    case 'collectAllBut':
    case 'dropAllBut':
    case 'collectPercentage':
    case 'dropPercentage':
    case 'garrison':
      return true;
  }

  return false;
};

const isActionRequiresPercentage = (action: CarrierWaypointActionType) => {
  return action === 'dropPercentage' || action === 'collectPercentage';
};

const getWaypointActionFriendlyText = (waypoint: CarrierWaypoint<string>, action: CarrierWaypointActionType) => {
  action = action || waypoint.action;

  switch (action) {
    case 'nothing':
      return 'Do Nothing'
    case 'collectAll':
      return 'Collect All'
    case 'dropAll':
      return 'Drop All'
    case 'collect':
      return `Collect ${waypoint.actionShips}`
    case 'drop':
      return `Drop ${waypoint.actionShips}`
    case 'collectAllBut':
      return `Collect All But ${waypoint.actionShips}`
    case 'dropAllBut':
      return `Drop All But ${waypoint.actionShips}`
    case 'garrison':
      return `Garrison ${waypoint.actionShips}`
    case 'dropPercentage':
      return `Drop ${waypoint.actionShips}%`
    case 'collectPercentage':
      return `Collect ${waypoint.actionShips}%`
  }
};

const recalculateWaypointEta = () => {
  // Calculate the ticks + delay up to and including the current waypoint.
  let index = waypoints.value.indexOf(currentWaypoint.value);
  let totalTicks = 0;

  for (let i = 0; i <= index; i++) {
    const wp = waypoints[i];

    // wp.ticks includes delayTicks
    totalTicks += wp.ticks;
  }

  waypointEta.value = GameHelper.getCountdownTimeStringByTicks(game.value, totalTicks);
};

const recalculateWaypointDuration = () => {
  if (currentWaypoint.value) {
    const timeRemainingEtaDate = GameHelper.calculateTimeByTicks((currentWaypoint.value.ticks || 0) + currentWaypoint.value.delayTicks, game.value.settings.gameTime.speed, null);
    waypointDuration.value = GameHelper.getCountdownTimeString(game.value, timeRemainingEtaDate, true);
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

const isFirstWaypoint = (waypoint: CarrierWaypoint<string>) => {
  return waypoints.value.indexOf(waypoint) === 0;
}

const doSaveWaypoints = async (saveAndEdit = false) => {
  isSavingWaypoints.value = true
  const response = await saveWaypoints(httpClient)(game.value, carrier.value._id, waypoints.value, carrier.value.waypointsLooped)

  if (isOk(response)) {
    AudioService.join()

    const newWaypoints = response.data.waypoints;

    // todo: recalculate waypoints

    toast.default(`${carrier.value.name} waypoints updated.`)

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, {carrier: carrier.value});

    if (saveAndEdit) {
      emit('onOpenCarrierDetailRequested', carrier.value._id);
    } else {
      onCloseRequested();
    }
  }

  isSavingWaypoints.value = false;
};

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
</style>
