<template>
<div class="menu-page container">
    <menu-title title="Ship Transfer" @onCloseRequested="onCloseRequested"/>

    <div class="row mb-0">
      <div class="col text-center pt-2 pb-2">
        <p class="mb-0"><small>While in <strong>orbit</strong> of a star you may transfer ships.</small></p>
      </div>
    </div>

    <div class="row mb-0 pt-2 pb-2 bg-dark" v-if="carrier && carrier.waypoints && carrier.waypoints.length">
      <div class="col">
        <p class="mb-0"><i class="fas fa-map-marker-alt me-2"></i><strong>{{carrier.name}}</strong>'s next waypoint is to <star-label :starId="carrierWaypointDestination"/>.</p>
      </div>
    </div>

    <div class="row mt-2">
        <div class="col" v-if="star">
            <p class="mb-0"><i class="fas fa-star me-1"></i>{{star.name}}</p>
        </div>
        <div class="col" v-if="carrier">
            <p class="mb-0"><i class="fas fa-rocket me-1"></i>{{carrier.name}}</p>
        </div>
    </div>

    <div class="row mb-1">
        <div class="col">
            <input v-model="starShips" type="number" class="form-control" @input="onStarShipsChanged" @blur="onStarShipsBlur">
        </div>
        <div class="col">
            <input v-model="carrierShips" type="number" class="form-control" @input="onCarrierShipsChanged" @blur="onCarrierShipsBlur">
        </div>
    </div>

    <div class="row mb-2">
        <div class="col-6">
            <div class="row g-0">
                <div class="col-4">
                  <div class="d-grid gap-2">
                    <button type="button" title="Transfer all ships to the star" class="btn btn-danger" @click="onMinShipsClicked">Min</button>
                  </div>
                </div>
                <div class="col">
                    <button type="button" title="Transfer 1 ship to the star" class="btn btn-outline-primary float-end ms-1" @click="onTransferLeftClicked(1)" :disabled="carrierShips <= 1"><i class="fas fa-angle-left"></i></button>
                    <button type="button" title="Transfer 10 ships to the star"  class="btn btn-outline-primary ms-1 float-end" @click="onTransferLeftClicked(10)" :disabled="carrierShips <= 10"><i class="fas fa-angle-double-left"></i></button>
                    <button type="button" title="Transfer 100 ships to the star"  class="btn btn-outline-primary float-end" @click="onTransferLeftClicked(100)" :disabled="carrierShips <= 100"><i class="fas fa-angle-left"></i><i class="fas fa-angle-double-left"></i></button>
                </div>
            </div>
        </div>

        <div class="col-6">
            <div class="row g-0">
                <div class="col">
                    <button type="button" title="Transfer 1 ship to the carrier" class="btn btn-outline-primary" @click="onTransferRightClicked(1)" :disabled="starShips <= 0"><i class="fas fa-angle-right"></i></button>
                    <button type="button" title="Transfer 10 ships to the carrier"  class="btn btn-outline-primary ms-1" @click="onTransferRightClicked(10)" :disabled="starShips < 10"><i class="fas fa-angle-double-right"></i></button>
                    <button type="button" title="Transfer 100 ships to the carrier"  class="btn btn-outline-primary ms-1 " @click="onTransferRightClicked(100)" :disabled="starShips < 100"><i class="fas fa-angle-double-right"></i><i class="fas fa-angle-right"></i></button>
                </div>
                <div class="col-4">
                  <div class="d-grid gap-2">
                    <button type="button" title="Transfer all ships to the carrier" class="btn btn-success" @click="onMaxShipsClicked">Max</button>
                  </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row pb-2 pt-2 bg-dark">
        <div class="col-6"></div>
        <div class="col pe-0">
          <div class="d-grid gap-2">
            <button type="button" class="btn btn-success me-1" :disabled="isHistoricalMode || isTransferringShips || starShips < 0 || carrierShips < 1" @click="saveTransfer">
              <i class="fas fa-check"></i>
              Transfer
            </button>
          </div>
        </div>
        <div class="col-auto ps-0" v-if="canEditWaypoints">
            <button type="button" class="btn btn-outline-primary" @click="onEditWaypointsRequested"><i class="fas fa-map-marker-alt"></i></button>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper';
import MenuTitle from '../MenuTitle.vue';
import StarLabel from '../star/StarLabel.vue';
import { ref, computed, inject, watch, onMounted } from 'vue';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import type {Game, Star, Carrier} from "@/types/game";
import {transferShips} from "@/services/typedapi/carrier";
import {useIsHistoricalMode} from "@/util/reactiveHooks";

const props = defineProps<{
  carrierId: string,
}>();

const emit = defineEmits<{
  onCloseRequested: [e: Event],
  onShipsTransferred: [carrierId: string],
  onEditWaypointsRequested: [carrierId: string],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const isHistoricalMode = useIsHistoricalMode(store);

const game = computed<Game>(() => store.state.game);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const carrier = ref<Carrier | undefined>(GameHelper.getCarrierById(game.value, props.carrierId));
const carrierOwningPlayer = computed(() => carrier.value && GameHelper.getCarrierOwningPlayer(game.value, carrier.value));
const star = ref<Star | undefined>(carrier.value?.orbiting && GameHelper.getStarById(game.value, carrier.value.orbiting) || undefined);
const canEditWaypoints = computed(() => {
  return userPlayer.value &&
         carrierOwningPlayer.value == userPlayer.value &&
         carrier.value &&
         !userPlayer.value.defeated &&
         !carrier.value.isGift &&
         !GameHelper.isGameFinished(game.value);
});
const carrierWaypointDestination = computed(() => carrier.value?.waypoints?.length && carrier.value.waypoints[0].destination || undefined);

const isTransferringShips = ref(false);
const starShips = ref(0);
const carrierShips = ref(0);

const onCloseRequested = (e: Event) => emit('onCloseRequested', e);

const ensureInt = (v: any): number => {
  v = parseInt(v);

  if (isNaN(v)) {
    v = 0;
  }

  return v;
};

const onMinShipsClicked = () => {
  carrierShips.value = 1;
  starShips.value = (carrier.value?.ships || 0) + (star.value?.ships || 0) - 1;
};

const onMaxShipsClicked = () => {
  starShips.value = 0;
  carrierShips.value = (carrier.value?.ships || 0) + (star.value?.ships || 0);
}

const onCarrierShipsChanged = () =>{
  const difference = ensureInt(carrierShips.value) - (carrier.value?.ships || 0);
  starShips.value = (star.value?.ships || 0) - difference;
};

const onStarShipsChanged = () => {
  const difference = ensureInt(starShips.value) - (star.value?.ships || 0);
  carrierShips.value = (carrier.value?.ships || 0) - difference;
};

const onStarShipsBlur = () => {
  starShips.value = ensureInt(starShips.value);
};

const onCarrierShipsBlur = () => {
  carrierShips.value = ensureInt(carrierShips.value);
};

const onTransferLeftClicked = (v: number) => {
  starShips.value += v;
  carrierShips.value -= v;
};

const onTransferRightClicked = (v: number) => {
  carrierShips.value += v;
  starShips.value -= v;
};

const onGameReloaded = (data) => {
  // When the game ticks there may have been ships built at the star.
  // Find the star in the tick report and compare the ships, then add
  // the difference to the star ships side on the transfer.

  // NOTE: At this stage the star will have the latest data for its ships
  // as the store deals with updating the star.
  carrier.value = GameHelper.getCarrierById(game.value, props.carrierId);
  star.value = carrier.value?.orbiting && GameHelper.getStarById(game.value, carrier.value.orbiting) || undefined;

  // If the game ticks then check to see if any ships have been built at the star.
  const totalInTransfer = starShips.value + carrierShips.value;
  const totalOriginal = (star.value?.ships || 0) + (carrier.value?.ships || 0);
  const difference = totalOriginal - totalInTransfer;

  // If there is a difference then this means that ship(s) have been built at the star
  // while the user has been on this screen, in that case, add the new ships to the star total
  if (difference) {
    starShips.value += difference;
    onStarShipsChanged();
  }
};

watch(game, (newGame, oldGame) => {
  onGameReloaded(newGame);
});

const performSaveTransfer = async () => {
  let transferred = false;

  if (!star.value || !carrier.value) {
    return transferred;
  }

  isTransferringShips.value = true;

  const cShips = carrierShips.value;
  const sShips = starShips.value;

  const response = await transferShips(httpClient)(game.value._id, props.carrierId, cShips, star.value!._id, sShips);
  if (isOk(response)) {
    toast.default(`Ships transferred between ${star.value.name} and ${carrier.value.name}.`);

    store.commit('gameStarCarrierShipTransferred', {
      starId: star.value._id,
      carrierId: carrier.value._id,
      starShips: sShips,
      carrierShips: cShips
    })

    star.value.ships = sShips
    carrier.value.ships = cShips

    transferred = true
  } else {
    toast.error('Failed to transfer ships.');
    console.error(formatError(response));
  }

  isTransferringShips.value = false;

  return transferred;
};

const saveTransfer = async () => {
  const result = await performSaveTransfer();

  if (result) {
    emit('onShipsTransferred', carrier.value!._id);
  }
};

const onEditWaypointsRequested = async () => {
  const result = await performSaveTransfer();

  if (result) {
    emit('onEditWaypointsRequested', carrier.value!._id);
  }
};

onMounted(() => {
  if (carrier.value && star.value) {
    let cShips = carrier.value.ships || 0;
    let sShips = star.value.ships || 0;

    if (sShips === 0 && cShips === 0) {
      return;
    }

    if ((cShips || 0) < 1) {
      cShips = 1;
      sShips = sShips - 1;
    }

    starShips.value = sShips;
    carrierShips.value = cShips;
  }

})

</script>

<style scoped>
</style>
