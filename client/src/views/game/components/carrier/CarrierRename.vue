<template>
<div class="menu-page container" v-if="carrierId">
  <menu-title title="Rename Carrier" @onCloseRequested="e => emit('onCloseRequested', e)" :disabled="isSaving">
    <button @click="viewOnMap" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
  </menu-title>

  <form @submit="doRename">
    <div class="mb-2">
      <input type="text" class="form-control" id="name" placeholder="Enter a new carrier name" v-model="currentName" minlength="3" maxlength="30">
    </div>
    <div class="mb-2 row pb-2 pt-2 ">
      <div class="col">
        <button type="button" class="btn btn-sm btn-primary" :disabled="isSaving" @click="_ => emit('onOpenCarrierDetailRequested', carrierId)">
          <i class="fas fa-arrow-left"></i>
          Back to Carrier
        </button>
      </div>
      <div class="col-auto">
        <button type="submit" class="btn btn-sm btn-success" :disabled="isHistoricalMode || isSaving || isNameInvalid">
          <i class="fas fa-save"></i>
          Rename
        </button>
      </div>
    </div>
  </form>
</div>
</template>

<script setup lang="ts">
import MenuTitle from '../MenuTitle.vue'
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {eventBusInjectionKey} from "@/eventBus";
import { inject, ref, computed } from 'vue';
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import type {Carrier, Game} from "@/types/game";
import GameHelper from "@/services/gameHelper";
import { useStore } from 'vuex';
import type {MapObject} from "@solaris-common";
import {rename} from "@/services/typedapi/carrier";

const props = defineProps<{
  carrierId: string,
}>();

const emit = defineEmits<{
  (e: 'onCloseRequested', event: Event): void;
  (e: 'onOpenCarrierDetailRequested', carrierId: string): void;
}>();

const store = useStore();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const game = computed<Game>(() => store.state.game);
const carrier = computed<Carrier>(() => GameHelper.getCarrierById(game.value, props.carrierId)!);

const isHistoricalMode = useIsHistoricalMode(store);

const isSaving = ref(false);
const currentName = ref(carrier.value.name);

const isNameInvalid = computed(() => {
  const trimmed = currentName.value.trim();

  return trimmed.length < 3 || trimmed.length > 30;
});

const viewOnMap = (e: Event) => {
  e.preventDefault();

  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, {object: carrier.value as MapObject<string> });
};

const doRename = async (e: Event) => {
  e.preventDefault();

  if (isNameInvalid.value) {
    return;
  }

  isSaving.value = true;

  const trimmed = currentName.value.trim();

  const response = await rename(httpClient)(game.value._id, props.carrierId, trimmed);

  if (isOk(response)) {
    carrier.value.name = trimmed;

    toast.default(`Carrier renamed to ${trimmed}.`);

    emit('onOpenCarrierDetailRequested', props.carrierId);
  } else {
    toast.error('Failed to rename carrier.');
    console.error(formatError(response));
  }

  isSaving.value = false;
};
</script>
