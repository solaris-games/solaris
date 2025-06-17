<template>
  <div class="menu-page container" v-if="star">
    <menu-title title="Build Carrier" @onCloseRequested="onCloseRequested" />

    <div class="row bg-dark mb-2">
      <div class="col text-center pt-3">
        <p>Build a new Carrier at <a href="javascript:;" @click="onOpenStarDetailRequested">{{ star.name }}</a>, decide
          how many ships the new Carrier will have.</p>
      </div>
    </div>

    <div class="row">
      <div class="col" v-if="star">
        <p class="mb-0">{{ star.name }}</p>
      </div>
      <div class="col">
        <p class="mb-0">New Carrier</p>
      </div>
    </div>

    <div class="row mb-1">
      <div class="col">
        <input v-model="starShips" type="number" class="form-control" @input="onStarShipsChanged"
          @blur="onStarShipsBlur">
      </div>
      <div class="col">
        <input v-model="carrierShips" type="number" class="form-control" @input="onCarrierShipsChanged"
          @blur="onCarrierShipsBlur">
      </div>
    </div>

    <div class="row mb-2">
      <div class="col-6">
        <div class="row g-0">
          <div class="col-4">
            <div class="d-grid gap-2">
              <button type="button" title="Transfer all ships to the star" class="btn btn-danger"
                @click="onMinShipsClicked">Min</button>
            </div>
          </div>
          <div class="col">
            <button type="button" title="Transfer 1 ship to the star" class="btn btn-outline-primary float-end ms-1"
              @click="onTransferLeftClicked(1)" :disabled="carrierShips <= 1"><i class="fas fa-angle-left"></i></button>
            <button type="button" title="Transfer 10 ships to the star" class="btn btn-outline-primary ms-1 float-end"
              @click="onTransferLeftClicked(10)" :disabled="carrierShips <= 10"><i
                class="fas fa-angle-double-left"></i></button>
            <button type="button" title="Transfer 100 ships to the star" class="btn btn-outline-primary float-end"
              @click="onTransferLeftClicked(100)" :disabled="carrierShips <= 100"><i class="fas fa-angle-left"></i><i
                class="fas fa-angle-double-left"></i></button>
          </div>
        </div>
      </div>

      <div class="col-6">
        <div class="row g-0">
          <div class="col">
            <button type="button" title="Transfer 1 ship to the carrier" class="btn btn-outline-primary"
              @click="onTransferRightClicked(1)" :disabled="starShips <= 0"><i class="fas fa-angle-right"></i></button>
            <button type="button" title="Transfer 10 ships to the carrier" class="btn btn-outline-primary ms-1"
              @click="onTransferRightClicked(10)" :disabled="starShips < 10"><i
                class="fas fa-angle-double-right"></i></button>
            <button type="button" title="Transfer 100 ships to the carrier" class="btn btn-outline-primary ms-1 "
              @click="onTransferRightClicked(100)" :disabled="starShips < 100"><i
                class="fas fa-angle-double-right"></i><i class="fas fa-angle-right"></i></button>
          </div>
          <div class="col-4">
            <div class="d-grid gap-2">
              <button type="button" title="Transfer all ships to the carrier" class="btn btn-success"
                @click="onMaxShipsClicked">Max</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row pb-2 pt-2 ">
      <div class="col">
        <button type="button" class="btn btn-outline-danger" :disabled="isBuildingCarrier"
          @click="onOpenStarDetailRequested">
          <i class="fas fa-arrow-left"></i>
          Back to Star
        </button>
      </div>
      <div class="col-auto">
        <div class="d-grid gap-2">
          <button type="button" class="btn btn-info"
            :disabled="isHistoricalMode || isBuildingCarrier || starShips < 0 || carrierShips < 1"
            @click="saveTransfer">
            <i class="fas fa-rocket"></i>
            Build for ${{ star.upgradeCosts!.carriers }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AudioService from '../../../../game/audio';
import GameHelper from '../../../../services/gameHelper';
import MenuTitle from '../MenuTitle.vue';
import { ref, computed, inject, type Ref, onMounted } from 'vue';
import { useStore, type Store } from 'vuex';
import type { State } from '@/store';
import { makeConfirm } from '@/util/confirm';
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { buildCarrier } from '@/services/typedapi/star';
import { toastInjectionKey } from '@/util/keys';
import type { Star } from '@/types/game';

const props = defineProps < {
  starId: string,
} > ();

const emit = defineEmits < {
  onCloseRequested: [],
  onOpenStarDetailRequested: [starId: string],
  onEditWaypointsRequested: [carrierId: string],
} > ();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();

const confirm = makeConfirm(store);

const star = ref(GameHelper.getStarById(store.state.game, props.starId) as Star);
const allStarShips = computed(() => star.value.ships || 0);
const starShips = ref(0);
const carrierShips = ref(allStarShips.value);
const isBuildingCarrier = ref(false);

const isHistoricalMode = computed(() => store.state.tick !== store.state.game.state.tick);

const ensureInt = (v: any) => {
  v = parseInt(v);

  if (isNaN(v)) {
    v = 0;
  }

  return v;
}

const onCloseRequested = () => emit('onCloseRequested');

const onStarShipsChanged = () => {
  const diff = ensureInt(starShips.value) - allStarShips.value;
  carrierShips.value = Math.abs(diff);
};

const onStarShipsBlur = () => {
  starShips.value = ensureInt(starShips.value);
};

const onCarrierShipsChanged = () => {
  const diff = ensureInt(carrierShips.value);
  starShips.value = allStarShips.value - diff;
};

const onCarrierShipsBlur = () => {
  carrierShips.value = ensureInt(carrierShips.value);
};

const onMinShipsClicked = () => {
  carrierShips.value = 1;
  starShips.value = allStarShips.value - 1;
};

const onMaxShipsClicked = () => {
  starShips.value = 0;
  carrierShips.value = allStarShips.value;
};

const onTransferLeftClicked = (delta: number) => {
  carrierShips.value -= delta;
  starShips.value += delta;
};

const onTransferRightClicked = (delta: number) => {
  carrierShips.value += delta;
  starShips.value -= delta;
};

const onOpenStarDetailRequested = () => {
  emit('onOpenStarDetailRequested', star.value._id);
};

const saveTransfer = async () => {
  if (store.state.settings.carrier.confirmBuildCarrier === 'enabled'
    && !await confirm('Build a carrier', `Are you sure you want to build a Carrier at ${star.value.name}? The carrier will cost $${star.value.upgradeCosts!.carriers}.`)) {
    return
  }

  isBuildingCarrier.value = true

  const ships = carrierShips.value;

  const response = await buildCarrier(httpClient)(store.state.game._id, star.value._id, ships);

  if (isOk(response)) {
    toast.default(`Carrier built at ${star.value.name}.`);

    store.commit('gameStarCarrierBuilt', response.data);

    AudioService.join();

    emit('onEditWaypointsRequested', response.data.carrier._id);
  } else {
    console.error(formatError(response));
    toast.error("Building carrier failed");
  }

  isBuildingCarrier.value = false;
};
</script>

<style scoped></style>
