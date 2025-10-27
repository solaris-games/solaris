<template>
<div class="menu-page container" v-if="carrier">
    <menu-title :title="carrier.name" @onCloseRequested="onCloseRequested">
      <button v-if="hasWaypoints" @click="onViewCombatCalculatorRequested" class="btn btn-sm btn-outline-warning"><i class="fas fa-calculator"></i></button>
      <modalButton modalName="scuttleCarrierModal" v-if="!isHistoricalMode && canScuttleCarrier" classText="btn btn-sm btn-outline-danger ms-1">
        <i class="fas fa-rocket"></i> <i class="fas fa-trash ms-1"></i>
      </modalButton>
      <button v-if="!isHistoricalMode && isOwnedByUserPlayer" @click="onCarrierRenameRequested" class="btn btn-sm btn-outline-success ms-1"><i class="fas fa-pencil-alt"></i></button>
      <button @click="viewOnMap" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <div class="row bg-dark" :class="{'bg-warning': carrier.isGift}">
      <div class="col text-center pt-2">
        <p class="mb-2 text-info">
          Location: {{formatLocation(carrier.location)}}
          <help-tooltip v-if="isGameDarkMode" tooltip="Coordinates are scrambled because this is a dark mode game."/>
        </p>
        <p class="mb-2" v-if="isUserPlayerCarrier && !carrier.isGift">A carrier under your command.</p>
        <p class="mb-2" v-if="isNotUserPlayerCarrier">This carrier is controlled by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{carrierOwningPlayer.alias}}</a>.</p>
        <p class="mb-2" v-if="carrier.isGift"><strong>This carrier is a gift.</strong></p>
        <p class="mb-2" v-if="carrier.isGift"><small>When the carrier arrives at another player's star, it will transfer ownership.</small></p>
      </div>
    </div>

    <div v-if="isCompactUIStyle">
      <div class="row mt-2">
        <div class="col">
          <span title="The carrier is in orbit" v-if="carrier.orbiting && carrierOrbitingStar">
            <i class="fas fa-star me-2"></i>
            <a href="javascript:;" @click="onOpenOrbitingStarDetailRequested">{{carrierOrbitingStar.name}}</a>
          </span>
          <span title="The carrier is in transit" v-if="!carrier.orbiting">
            <i class="fas fa-star me-2"></i>
            <a title="The carrier is in transit from this star" v-if="firstWaypointSource" href="javascript:;" @click="onOpenSourceStarDetailRequested">{{firstWaypointSource.name}}</a>
            <i class="fas fa-arrow-right me-2 ms-2"></i>
            <a title="The carrier is in transit to star" v-if="firstWaypointDestination" href="javascript:;" @click="onOpenDestinationStarDetailRequested">{{firstWaypointDestination.name}}</a>
          </span>
        </div>
        <div class="col-auto" v-if="carrier.effectiveTechs">
          <span title="The weapons level of this carrier">
            {{carrier.effectiveTechs.weapons}} <i class="fas fa-gun ms-1"></i>
          </span>
        </div>
        <div class="col-auto">
          <span title="The total number of ships the carrier has">
            {{carrier.ships == null ? '???' : carrier.ships}} <i class="fas fa-rocket"></i>
          </span>
        </div>
      </div>

      <div class="row pb-2">
        <div class="col">
          <span v-if="canShowSpecialist && isOwnedByUserPlayer && canHireSpecialist">
            <specialist-icon :type="'carrier'" :defaultIcon="'user-astronaut'" :specialist="carrier.specialist"></specialist-icon>
            <a href="javascript:;" @click="onViewHireCarrierSpecialistRequested">
              <span class="ms-1" v-if="carrier.specialist" :title="carrier.specialist.description">{{carrier.specialist.name}}</span>
              <span v-if="!carrier.specialist">No Specialist</span>
            </a>
            <span v-if="carrier.specialistId && carrier.specialistExpireTick" class="badge bg-warning ms-1"><i class="fas fa-stopwatch"></i> Expires Tick {{carrier.specialistExpireTick}}</span>
          </span>
          <span v-if="canShowSpecialist && (!isOwnedByUserPlayer || !canHireSpecialist)">
            <specialist-icon :type="'carrier'" :defaultIcon="'user-astronaut'" :specialist="carrier.specialist"></specialist-icon>
            <span v-if="carrier.specialist" class="ms-1">{{carrier.specialist.name}}</span>
            <span v-if="carrier.specialistId && carrier.specialistExpireTick" class="badge bg-warning ms-1"><i class="fas fa-stopwatch"></i> Expires Tick {{carrier.specialistExpireTick}}</span>
            <span v-if="!carrier.specialist">No Specialist</span>
          </span>
        </div>
        <div class="col-auto" v-if="carrier.effectiveTechs">
          <span title="The hyperspace range of this carrier">
            {{carrier.effectiveTechs.hyperspace}} <i class="fas fa-gas-pump ms-1"></i>
          </span>
        </div>
        <div class="col-auto">
          <span title="The total number of waypoints the carrier has - Plot waypoints to capture stars">
            {{carrier.waypoints.length}}
            <i class="fas fa-map-marker-alt ms-1" v-if="!carrier.waypointsLooped"></i>
            <i class="fas fa-sync ms-1" v-if="carrier.waypointsLooped"></i>
          </span>
        </div>
      </div>

      <div class="row pb-2" v-if="carrier.specialist">
        <div class="col">
          <p class="mb-0"><small>{{carrier.specialist.description}}</small></p>
        </div>
      </div>

      <div class="row pb-2 pt-2 " v-if="!isHistoricalMode && (canGiftCarrier || canTransferShips || canEditWaypoints)">
        <div class="col">
          <button class="btn btn-sm btn-primary me-1" @click="onShipTransferRequested" v-if="canTransferShips">
            Transfer <i class="fas fa-exchange-alt"></i>
          </button>
          <button class="btn btn-sm btn-warning" @click="onConfirmGiftCarrier" v-if="canGiftCarrier">
            Gift <i class="fas fa-gift"></i>
          </button>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-success btn-sm" v-if="canEditWaypoints && carrier.waypoints.length > 1 && !carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Loop
            <i class="fas fa-sync"></i>
          </button>
          <button class="btn btn-danger btn-sm ms-1" v-if="canEditWaypoints && carrier.waypoints.length > 1 && carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Unloop
            <i class="fas fa-map-marker-alt"></i>
          </button>
          <button class="btn btn-sm btn-success ms-1" v-if="canEditWaypoints" @click="editWaypoints()">
            Waypoints
            <i class="fas fa-map-marker-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isStandardUIStyle" class="mb-2">
      <!-- TODO: This should be a component -->
      <div class="row mb-0 pt-2 pb-2 bg-primary">
          <div class="col">
              Ships
          </div>
          <div class="col text-end">
              {{carrier.ships == null ? '???' : carrier.ships}} <i class="fas fa-rocket ms-1"></i>
          </div>
      </div>
      <div class="row mb-0 pt-1 pb-1" v-if="carrier.effectiveTechs">
          <div class="col">
              Weapons
          </div>
          <div class="col text-end">
              {{carrier.effectiveTechs.weapons}} <i class="fas fa-gun ms-1"></i>
          </div>
      </div>
      <div class="row mb-0 pt-1 pb-1 bg-dark" v-if="carrier.effectiveTechs">
          <div class="col">
              Hyperspace Range
          </div>
          <div class="col text-end">
              {{carrier.effectiveTechs.hyperspace}} <i class="fas fa-gas-pump ms-1"></i>
          </div>
      </div>
    </div>

    <h4 class="pt-0" v-if="isStandardUIStyle">Navigation</h4>

    <div>
      <div v-if="carrier.orbiting && carrierOrbitingStar && isStandardUIStyle" class="row bg-dark pt-2 pb-0 mb-1">
        <div class="col">
          <p class="mb-2 align-middle">Orbiting: <a href="javascript:;" @click="onOpenOrbitingStarDetailRequested">{{carrierOrbitingStar.name}}</a></p>
        </div>
        <div class="col-auto" v-if="!isHistoricalMode && isStarOwnedByUserPlayer">
          <button class="btn btn-sm btn-outline-primary mb-2" @click="onShipTransferRequested" v-if="canTransferShips">
            <i class="fas fa-exchange-alt"></i> Ship Transfer
          </button>
        </div>
      </div>

      <div v-if="isStandardUIStyle && !hasWaypoints" class="row pt-2 pb-2 mb-0">
        <div class="col">
          <p class="mb-0">Waypoints: None.</p>
        </div>
      </div>

      <div v-if="(hasWaypoints && isStandardUIStyle) || (hasWaypoints && isUserPlayerCarrier)" class="row pt-0 pb-0 mb-0">
        <waypointTable :carrier="carrier"
          @onEditWaypointRequested="onEditWaypointRequested"
          @onEditWaypointsRequested="editWaypoints"
          @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      </div>

      <div class="row pt-2 pb-2" v-if="hasWaypoints">
        <div class="col">
          <span>ETA<orbital-mechanics-e-t-a-warning />: {{timeRemainingEta}} <span v-if="carrier.waypoints.length > 1">({{timeRemainingEtaTotal}})</span></span>
        </div>
        <div class="col">
          <span>Speed: {{carrierSpeed}}</span>
        </div>
      </div>

      <div v-if="!isHistoricalMode && canEditWaypoints && isStandardUIStyle" class="row bg-dark pt-2 pb-2 mb-0">
        <div class="col">
          <button class="btn btn-sm btn-outline-success" v-if="carrier.waypoints.length > 1 && !carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Loop
            <i class="fas fa-sync"></i>
          </button>
          <button class="btn btn-sm btn-danger" v-if="carrier.waypoints.length > 1 && carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Unloop
            <i class="fas fa-map-marker-alt"></i>
          </button>
        </div>
        <div class="col-auto">
          <button class="btn btn-sm btn-success" @click="editWaypoints()">
            Edit Waypoints
            <i class="fas fa-map-marker-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isStandardUIStyle">
      <h4 class="pt-2" v-if="canShowSpecialist">Specialist</h4>

      <carrier-specialist v-if="canShowSpecialist" :carrierId="carrier._id" @onViewHireCarrierSpecialistRequested="onViewHireCarrierSpecialistRequested"/>
    </div>

    <div v-if="isStandardUIStyle">
      <h4 class="pt-2" v-if="canGiftCarrier">Gift Carrier</h4>

      <gift-carrier v-if="canGiftCarrier" :carrierId="carrier._id"/>
    </div>

    <!-- Modals -->
    <dialogModal modalName="scuttleCarrierModal" titleText="Scuttle Carrier" cancelText="No" confirmText="Yes" @onConfirm="confirmScuttleCarrier">
      <p>Are you sure you want to scuttle <b>{{carrier.name}}</b>?</p>
    </dialogModal>
</div>
</template>

<script setup lang="ts">
import { inject, computed, ref, onMounted, onUnmounted } from 'vue';
import GameHelper from '../../../../services/gameHelper'
import MenuTitle from '../MenuTitle.vue'
import WaypointTable from './WaypointTable.vue'
import CarrierSpecialist from './CarrierSpecialist.vue'
import GiftCarrier from './GiftCarrier.vue'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import ModalButton from '../../../components/modal/ModalButton.vue'
import DialogModal from '../../../components/modal/DialogModal.vue'
import AudioService from '../../../../game/audio'
import OrbitalMechanicsETAWarning from '../shared/OrbitalMechanicsETAWarning.vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'
import {formatLocation} from "client/src/util/format";
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {Carrier, Game, Player} from "@/types/game";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import { useStore } from 'vuex';
import MapEventBusEventNames from "@/eventBusEventNames/map";
import type {CarrierWaypoint, MapObject, UserGameSettings} from "@solaris-common";
import {gift, loop, scuttle} from "@/services/typedapi/carrier";
import {makeConfirm} from "@/util/confirm";

const props = defineProps<{
  carrierId: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [event: Event],
  onCarrierRenameRequested: [carrierId: string],
  onViewHireCarrierSpecialistRequested: [carrierId: string],
  onViewCarrierCombatCalculatorRequested: [carrierId: string],
  onOpenPlayerDetailRequested: [playerId: string],
  onOpenStarDetailRequested: [starId: string],
  onEditWaypointsRequested: [carrierId: string],
  onShipTransferRequested: [carrierId: string],
  onEditWaypointRequested: [{carrierId: string, waypoint: CarrierWaypoint<string>}],
}>();

const store = useStore();
const confirm = makeConfirm(store);

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const isLoopingWaypoints = ref(false);
const isGiftingCarrier = ref(false);

const settings = computed<UserGameSettings>(() => store.state.settings);

const game = computed<Game>(() => store.state.game);
const userPlayer = computed<Player | undefined>(() => GameHelper.getUserPlayer(game.value));
const carrier = computed<Carrier>(() => GameHelper.getCarrierById(game.value, props.carrierId)!);
const carrierOwningPlayer = computed<Player>(() => GameHelper.getPlayerById(game.value, carrier.value.ownedByPlayerId!)!);

const firstWaypoint = computed(() => carrier.value.waypoints.length ? carrier.value.waypoints[0] : null);
const firstWaypointSource = computed(() => firstWaypoint.value ? GameHelper.getStarById(game.value, firstWaypoint.value.source) || null : null);
const carrierOrbitingStar = computed(() => carrier.value.orbiting ? GameHelper.getStarById(game.value, carrier.value.orbiting) : null);
const firstWaypointDestination = computed(() => firstWaypoint.value ? GameHelper.getStarById(game.value, firstWaypoint.value.destination) || null : null);

const canGiftCarrier = computed<boolean>(() => Boolean(game.value.settings.specialGalaxy.giftCarriers === 'enabled'
  && carrier.value
  && userPlayer.value
  && carrierOwningPlayer.value._id === userPlayer.value._id
  && !carrier.value.isGift
  && !userPlayer.value.defeated
  && !GameHelper.isGameFinished(store.state.game)
));

const isOwnedByUserPlayer = computed(() => {
  return carrierOwningPlayer.value && userPlayer.value && carrierOwningPlayer.value._id === userPlayer.value._id;
});

const isGameInProgress = computed(() => GameHelper.isGameInProgress(game.value));

const canScuttleCarrier = computed(() => {
  return isOwnedByUserPlayer.value && !userPlayer.value!.defeated && isGameInProgress.value && !carrier.value.isGift;
});

const isUserPlayerCarrier = computed(() => {
  return carrier.value && userPlayer.value && carrier.value.ownedByPlayerId == userPlayer.value._id;
});

const isNotUserPlayerCarrier = computed(() => !isUserPlayerCarrier.value);

const hasWaypoints = computed(() => carrier.value.waypoints && carrier.value.waypoints.length > 0);

const canEditWaypoints = computed(() => {
  return userPlayer.value
    && carrierOwningPlayer.value._id === userPlayer.value._id
    && carrier.value
    && !userPlayer.value.defeated
    && !carrier.value.isGift
    && !GameHelper.isGameFinished(game.value);
});

const canTransferShips = computed(() => {
  return isUserPlayerCarrier.value
    && carrier.value.orbiting
    && userPlayer.value
    && !userPlayer.value.defeated
    && !GameHelper.isGameFinished(game.value);
});

const canShowSpecialist = computed(() => {
  return game.value.settings.specialGalaxy.specialistCost !== 'none' && (carrier.value.specialistId || isUserPlayerCarrier.value);
});

const isDeadStar = computed(() => {
  return GameHelper.isDeadStar(carrierOrbitingStar.value);
});

const isStarOwnedByUserPlayer = computed(() => {
  if (!carrierOrbitingStar.value) {
    return false;
  }

  const owner = GameHelper.getStarOwningPlayer(game.value, carrierOrbitingStar.value);

  return owner && userPlayer.value && owner._id === userPlayer.value._id;
});

const isGameDarkMode = computed(() => GameHelper.isDarkMode(game.value));

const carrierSpeed = computed(() => {
  return GameHelper.getCarrierSpeed(game.value, carrierOwningPlayer.value, carrier.value, firstWaypointSource.value, firstWaypointDestination.value);
});

const canHireSpecialist = computed(() => {
  return canShowSpecialist.value
    && carrier.value.orbiting
    && isStarOwnedByUserPlayer.value
    && !GameHelper.isGameFinished(game.value)
    && !isDeadStar.value
    && (!carrier.value.specialistId || !carrier.value.specialist!.oneShot);
});

const isStandardUIStyle = computed(() => settings.value.interface.uiStyle === 'standard');
const isCompactUIStyle = computed(() => settings.value.interface.uiStyle === 'compact');

const timeRemainingEta = ref('');
const timeRemainingEtaTotal = ref('');

const intervalFunction = ref(0);

const isHistoricalMode = useIsHistoricalMode(store);

const onOpenPlayerDetailRequested = (e: Event) => {
  e.preventDefault();
  emit('onOpenPlayerDetailRequested', carrierOwningPlayer.value._id);
};

const onOpenStarDetailRequested = (starId: string) => {
  emit('onOpenStarDetailRequested', starId);
};

const onViewCombatCalculatorRequested = () => {
  emit('onViewCarrierCombatCalculatorRequested', carrier.value._id);
};

const onWaypointCreated = () => {

};

const onShipTransferRequested = (e: Event) => {
  e.preventDefault();
  emit('onShipTransferRequested', carrier.value._id);
};

const recalculateTimeRemaining = () => {
  if (carrier.value.ticksEta) {
    timeRemainingEta.value = GameHelper.getCountdownTimeStringByTicks(game.value, carrier.value.ticksEta);
  }

  if (carrier.value.ticksEtaTotal) {
    timeRemainingEtaTotal.value = GameHelper.getCountdownTimeStringByTicks(game.value, carrier.value.ticksEtaTotal);
  }
};

const onCloseRequested = (e: Event) => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandUnselectAllCarriers, {});
  emit('onCloseRequested', e);
};

const onCarrierRenameRequested = () => {
  emit('onCarrierRenameRequested', carrier.value._id);
};

const onViewHireCarrierSpecialistRequested = () => {
  emit('onViewHireCarrierSpecialistRequested', carrier.value._id);
};

const viewOnMap = (e: Event) => {
  e.preventDefault();
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: carrier.value as MapObject<string> });
};

const editWaypoints = () => {
  emit('onEditWaypointsRequested', carrier.value._id);
};

const onEditWaypointRequested = (e: CarrierWaypoint<string>) => {
  emit('onEditWaypointRequested', { carrierId: carrier.value._id, waypoint: e });
};

const onOpenOrbitingStarDetailRequested = (e: Event) => {
  e.preventDefault();

  if (carrierOrbitingStar.value) {
    emit('onOpenStarDetailRequested', carrierOrbitingStar.value._id);
  }
};

const onOpenSourceStarDetailRequested = (e: Event) => {
  e.preventDefault();

  if (firstWaypointSource.value) {
    emit('onOpenStarDetailRequested', firstWaypointSource.value._id);
  }
};

const onOpenDestinationStarDetailRequested = (e: Event) => {
  e.preventDefault();

  if (firstWaypointDestination.value) {
    emit('onOpenStarDetailRequested', firstWaypointDestination.value._id);
  }
};

const confirmScuttleCarrier = async () => {
  const response = await scuttle(httpClient)(game.value._id, carrier.value._id);

  if (isOk(response)) {
    toast.default(`${carrier.value.name} has been scuttled. All ships will be destroyed.`);

    store.commit('gameCarrierScuttled', {
      carrierId: carrier.value._id
    });

    AudioService.leave();

    onCloseRequested(new Event('scuttle'));
  } else {
    console.error(formatError(response));
  }
};

const toggleWaypointsLooped = async () => {
  isLoopingWaypoints.value = true;

  const newLooped = !carrier.value.waypointsLooped;

  const response = await loop(httpClient)(game.value._id, carrier.value._id, newLooped);

  if (isOk(response)) {
    toast.default(`${carrier.value.name} waypoints updated.`);

    carrier.value.waypointsLooped = newLooped;

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: carrier.value });
  } else {
    console.error(formatError(response));
  }

  isLoopingWaypoints.value = false;
};

const onConfirmGiftCarrier = async () => {
  if (!await confirm('Gift a carrier', `Are you sure you want to convert ${carrier.value.name} into a gift? If the carrier has a specialist, and the destination star does not belong to an ally, then it will be retired when it arrives at the destination.`)) {
    return;
  }

  isGiftingCarrier.value = true;

  const response = await gift(httpClient)(game.value._id, carrier.value._id);

  if (isOk(response)) {
    carrier.value.isGift = true;
    carrier.value.waypointsLooped = false;

    const firstWaypoint = carrier.value.waypoints[0];
    firstWaypoint.action = 'nothing';
    firstWaypoint.actionShips = 0;
    firstWaypoint.delayTicks = 0;
    carrier.value.waypoints = [firstWaypoint];

    eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: carrier.value });

    toast.default(`${carrier.value.name} has been converted into a gift.`);
  } else {
    formatError(response);
  }

  isGiftingCarrier.value = false;
};

onMounted(() => {
  eventBus.on(MapEventBusEventNames.MapOnWaypointCreated, onWaypointCreated);

  if (GameHelper.isGameInProgress(game.value) || GameHelper.isGamePendingStart(game.value)) {
    intervalFunction.value = setInterval(recalculateTimeRemaining, 250)
    recalculateTimeRemaining();
  }

  onUnmounted(() => {
    eventBus.off(MapEventBusEventNames.MapOnWaypointCreated, onWaypointCreated);
    clearInterval(intervalFunction.value);
  });
});
</script>

<style scoped>
</style>
