<template>
	<div class="menu-page container" v-if="carrier">
    <menu-title :title="carrier.name" @onCloseRequested="onCloseRequested">
      <span class="me-2" title="Hyperspace technology level" v-if="userPlayer"><i class="fas fa-gas-pump me-1"></i>{{userPlayer.research.hyperspace.level}}</span>
      <span class="me-2"><i class="fas fa-rocket me-1"></i>{{carrier.ships == null ? '???' : carrier.ships}}</span>
    	<button class="btn btn-sm btn-outline-info" @click="toggleCarrierWaypointsDisplay" title="Toggle waypoints display">
        <i class="fas" :class="{'fa-eye-slash':!display,'fa-eye':display}"></i>
      </button>
    </menu-title>

    <p v-if="!display" class="pb-2 text-warning">
      <small><i>Click the <i class="fas fa-eye-slash"></i> button to view the waypoints.</i></small>
    </p>

    <template v-if="display">
      <strong>Waypoints</strong>:
      <span v-if="!carrier.waypoints.length" class="text-warning">None</span>
		  <ul class="ps-4 mt-2" v-if="isStandardUIStyle">
		  	<li v-for="waypoint in carrier.waypoints" :key="waypoint._id">
		  		<!-- <a href="javascript:;" @click="onOpenStarDetailRequested(waypoint.destination)">{{getStarName(waypoint.destination)}}</a> -->
		  		<span>{{getStarName(waypoint.destination)}}</span>

		  		<i class="ms-2" :class="{
		  			'fas fa-angle-double-up text-success': waypoint.action == 'collectAll',
		  			'fas fa-angle-double-down text-danger': waypoint.action == 'dropAll',
		  			'fas fa-caret-up text-success': waypoint.action == 'collect',
		  			'fas fa-caret-down text-danger': waypoint.action == 'drop',
		  			'fas fa-angle-up text-success': waypoint.action == 'collectAllBut',
		  			'fas fa-angle-down text-danger': waypoint.action == 'dropAllBut',
		  			'fas fa-star text-warning': waypoint.action == 'garrison'
		  		}"></i>
		  		<span v-if="waypoint.actionShips"> {{waypoint.actionShips}}</span>
		  	</li>
		  </ul>

      <span v-if="isCompactUIStyle">{{waypointAsList}}</span>

      <form-error-list v-bind:errors="errors" class="mt-2"/>

		  <div class="row mt-2">
		  	<div class="col-12 pt-2 pb-2 bg-dark" v-if="carrier.waypoints && carrier.waypoints.length">
          <!--Yes, that key-property depending on the current date is there for a reason. Otherwise, under certain circumstances, the text is not updated on screen on iOS Safari.-->
          <!-- https://stackoverflow.com/questions/55008261/my-react-component-does-not-update-in-the-safari-browser -->
          <!-- Seriously, what is wrong with you, Safari? -->
		  		<p class="mb-0" :key="(new Date()).getTime().toString()" v-if="totalTicksEta !== null && totalTicksEta !== undefined && carrier.waypoints.length">
            <timer :ticks="totalTicksEta" :show-e-t-a="true" />
            <orbital-mechanics-e-t-a-warning />
          </p>
		  	</div>
      </div>

      <div class="row bg-dark pt-2 pb-2">
		  	<div class="col">
		  		<button class="btn btn-sm btn-warning" @click="removeLastWaypoint()" :disabled="isSavingWaypoints">
            <i class="fas fa-undo"></i>
            <span class="ms-1 d-none d-sm-inline-block">Last</span>
          </button>
		  		<button class="btn btn-sm btn-outline-danger ms-1" @click="removeAllWaypoints()" :disabled="isSavingWaypoints">
            <i class="fas fa-trash"></i>
            <span class="ms-1 d-none d-sm-inline-block">All</span>
          </button>
		  		<button class="btn btn-sm ms-1" :class="{'btn-success':carrier.waypointsLooped,'btn-outline-primary':!carrier.waypointsLooped}" @click="toggleLooped()" :disabled="!canLoop" title="Loop/Unloop the carrier's waypoints">
            <i class="fas fa-sync"></i>
          </button>
		  	</div>
		  	<div class="col-auto" v-if="!isHistoricalMode">
		  		<button class="btn btn-sm btn-outline-success ms-1" @click="doSaveWaypoints()" :disabled="isSavingWaypoints">
            <i class="fas fa-save"></i>
            <span class="ms-1">Save</span>
          </button>
		  		<button class="btn btn-sm btn-success ms-1" @click="doSaveWaypoints(true)" :disabled="isSavingWaypoints">
            <i class="fas fa-edit"></i>
            <span class="ms-1 d-none d-sm-inline-block">Save &amp; Edit</span>
          </button>
		  	</div>
		  </div>
    </template>
	</div>
</template>

<script setup lang="ts">
import {computed, inject, onMounted, onUnmounted, ref} from 'vue';
import MenuTitle from '../MenuTitle.vue'
import FormErrorList from '../../../components/FormErrorList.vue'
import GameHelper from '../../../../services/gameHelper'
import AudioService from '../../../../game/audio'
import OrbitalMechanicsETAWarning from '../shared/OrbitalMechanicsETAWarning.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapEventBusEventNames from "@/eventBusEventNames/map";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {type Mode, ModeKind} from "@/game/map";
import {toastInjectionKey} from "@/util/keys";
import {httpInjectionKey, isOk} from "@/services/typedapi";
import {useStore} from 'vuex';
import type {Carrier, Game, Player} from "@/types/game";
import type {CarrierWaypoint} from "@solaris-common";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {saveWaypoints} from "@/services/typedapi/carrier";
import type {TempWaypoint} from "@/types/waypoint";
import {gameServicesKey, useGameServices} from "@/util/gameServices";
import {getCountdownTimeStringByTicks, getCountdownTimeStringWithETA} from "@/util/time";
import Timer from "@/views/game/components/time/Timer.vue";

const props = defineProps<{
  carrierId: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [],
  onOpenStarDetailRequested: [starId: string],
  onOpenCarrierDetailRequested: [carrierId: string],
  onEditWaypointRequested: [{ carrierId: string; waypoint: CarrierWaypoint<string> }],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const toast = inject(toastInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const isHistoricalMode = useIsHistoricalMode(store);

const game = computed<Game>(() => store.state.game);

const gameServices = useGameServices();

const isStandardUIStyle = computed(() => store.state.settings.interface.uiStyle === 'standard');
const isCompactUIStyle = computed(() => store.state.settings.interface.uiStyle === 'compact');

const userPlayer = computed<Player | undefined>(() => GameHelper.getUserPlayer(game.value));
const carrier = computed<Carrier>(() => GameHelper.getCarrierById(game.value, props.carrierId)!);
const canLoop = computed<boolean>(() => gameServices.waypointService.canLoop(game.value, carrier.value));
const waypointAsList = computed<string>(() => carrier.value.waypoints.map(w => getStarName(w.destination)).join(', '));

const isSavingWaypoints = ref(false);
const oldWaypoints = ref<CarrierWaypoint<string>[]>([]);
const oldWaypointsLooped = ref(false);
const totalTicksEta = ref<number | null>(null);
const errors = ref<string[]>([]);
const display = ref(true);

const onCloseRequested = () => {
  emit('onCloseRequested');
};

const toggleLooped = () => {
  carrier.value.waypointsLooped = !carrier.value.waypointsLooped;
};

const getStarName = (starId: string) => {
  const star = GameHelper.getStarById(game.value, starId);
  return star ? star.name : 'Unknown Star';
};

const recalculateLooped = () => {
  if (carrier.value.waypointsLooped) {
    carrier.value.waypointsLooped = canLoop.value;
  }
};

const recalculateTotalEta = () => {
  totalTicksEta.value = gameServices.waypointService.calculateWaypointTicksEta(game.value, carrier.value,
    carrier.value.waypoints[carrier.value.waypoints.length - 1]);
};

const removeLastWaypoint = () => {
  // If the carrier is not currently in transit to the waypoint
  // then remove it.
  const lastWaypoint = carrier.value.waypoints[carrier.value.waypoints.length - 1];

  if (!GameHelper.isCarrierInTransitToWaypoint(carrier.value, lastWaypoint)) {
    carrier.value.waypoints.splice(carrier.value.waypoints.indexOf(lastWaypoint), 1);

    eventBus.emit(MapCommandEventBusEventNames.MapCommandUpdateWaypoints, {});
  }

  if (!carrier.value.waypoints.length) {
    totalTicksEta.value = null;
  }

  AudioService.backspace();

  recalculateTotalEta();
  recalculateLooped();
};

const doSaveWaypoints = async (saveAndEdit = false) => {
  isSavingWaypoints.value = true
  const response = await saveWaypoints(httpClient)(game.value._id, carrier.value._id, carrier.value.waypoints, carrier.value.waypointsLooped)

  if (isOk(response)) {
    AudioService.join();

    carrier.value.waypoints = response.data.waypoints;

    gameServices.waypointService.populateCarrierWaypointEta(game.value, carrier.value);

    oldWaypoints.value = carrier.value.waypoints.slice(0);
    oldWaypointsLooped.value = carrier.value.waypointsLooped;

    toast.default(`${carrier.value.name} waypoints updated.`)

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, {carrier: carrier.value});

    if (saveAndEdit) {
      emit('onOpenCarrierDetailRequested', carrier.value._id);
    } else {
      onCloseRequested();
    }

    if (saveAndEdit) {
      if (carrier.value.waypoints.length) {
        emit('onEditWaypointRequested', {
          carrierId: carrier.value._id,
          waypoint: carrier.value.waypoints[0],
        })
      } else {
        emit('onOpenCarrierDetailRequested', carrier.value._id);
      }
    } else {
      onCloseRequested();
    }
  };

  isSavingWaypoints.value = false;
};

const removeAllWaypoints = () => {
  // Remove all waypoints up to the last waypoint (if in transit)
  carrier.value.waypoints = carrier.value.waypoints.filter(w => GameHelper.isCarrierInTransitToWaypoint(carrier.value, w));

  eventBus.emit(MapCommandEventBusEventNames.MapCommandUpdateWaypoints, {});

  totalTicksEta.value = null;

  AudioService.backspace();

  recalculateTotalEta();
  recalculateLooped();
};

const onWaypointCreated = ({ waypoint }: { waypoint: TempWaypoint }) => {
  AudioService.type();

  recalculateTotalEta();
  recalculateLooped();
};

const toggleCarrierWaypointsDisplay = () => {
  display.value = !display.value;
};

const onWaypointOutOfRange = () => {
  toast.error(`This waypoint is out of hyperspace range.`);
};

onMounted(() => {
  const mode: Mode = {
    mode: ModeKind.Waypoints,
    carrier: carrier.value,
  };

  eventBus.emit(MapCommandEventBusEventNames.MapCommandSetMode, mode as Mode);
  eventBus.on(MapEventBusEventNames.MapOnWaypointCreated, onWaypointCreated);
  eventBus.on(MapEventBusEventNames.MapOnWaypointOutOfRange, onWaypointOutOfRange);

  oldWaypoints.value = carrier.value.waypoints.slice(0);
  oldWaypointsLooped.value = carrier.value.waypointsLooped;

  recalculateTotalEta();

  onUnmounted(() => {
    carrier.value.waypoints = oldWaypoints.value;
    carrier.value.waypointsLooped = oldWaypointsLooped.value;

    eventBus.emit(MapCommandEventBusEventNames.MapCommandUpdateWaypoints, {});
    eventBus.emit(MapCommandEventBusEventNames.MapCommandResetMode, {});

    eventBus.off(MapEventBusEventNames.MapOnWaypointCreated, onWaypointCreated);
    eventBus.off(MapEventBusEventNames.MapOnWaypointOutOfRange, onWaypointOutOfRange);
  })
});
</script>

<style scoped>
li {
	list-style-type: none;
}
</style>
