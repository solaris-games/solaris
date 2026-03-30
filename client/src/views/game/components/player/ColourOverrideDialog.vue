<template>
  <div class="modal fade" id="colourOverride" tabindex="-1" role="dialog" aria-labelledby="modalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content" v-if="player">
        <div class="modal-header">
          <h5 class="modal-title" id="modalLabel">{{ title }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="colour-override-controls form-group">
            <label for="colour">Colour</label>
            <select v-model="currentColour">
              <option v-for="colour in colourStore.coloursConfig" :value="colour.alias">{{ colour.alias }}</option>
            </select>
            <span class="override-current-colour" :style="{ 'background-color': toColourValue(currentColour!) }" />
            <button class="btn btn-default btn-sm" v-on:click="setToDefault">Use default</button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="onCancel" type="button" class="btn btn-outline-danger ps-3 pe-3" data-bs-dismiss="modal">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button @click="onConfirm" type="button" class="btn btn-success ps-3 pe-3" data-bs-dismiss="modal">
            <i class="fas fa-check"></i> Confirm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import gameHelper from "../../../../services/gameHelper";
import type {Game} from "@/types/game";
import {toastInjectionKey} from "@/util/keys.ts";
import { useColourStore } from '@/stores/colour';
import { eventBusInjectionKey } from '@/eventBus';
import { httpInjectionKey } from '@/services/typedapi';

const props = defineProps<{
  playerId: string,
}>();

const emit = defineEmits<{
  onColourOverrideCancelled: [],
  onColourOverrideConfirmed: [],
}>();

const toast = inject(toastInjectionKey)!;
const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const colourStore = useColourStore();
const game = computed<Game>(() => store.state.game);

const currentColour = ref<string | null>(null);
const modal = ref(null);

const player = computed(() => gameHelper.getPlayerById(game.value, props.playerId)!);
const title = computed(() => `Custom colour for ${player.value.alias}`)

const onCancel = () => emit('onColourOverrideCancelled');

const toColourValue = (alias: string) => colourStore.coloursConfig!.find(colour => colour.alias === alias)?.value;

const setToDefault = () => {
  currentColour.value = ensureExists(player.value.colour.alias);
}

const onConfirm = async () => {
  try {
    await colourStore.addColourMapping(httpClient, eventBus, game.value, store.state.settings, {
      playerId: player.value._id,
      colour: {
        alias: currentColour.value!,
        value: toColourValue(currentColour.value!)!,
      }
    });

    emit('onColourOverrideConfirmed');
  } catch (e) {
    console.error(e);
    toast.error(`There was a problem saving the custom colour`);
  }
}

const ensureExists = (alias: string) => {
  const existsA = colourStore.coloursConfig!.find(colour => colour.alias === alias);

  if (existsA) {
    return alias;
  }

  const existsV = colourStore.coloursConfig!.find(colour => colour.value === gameHelper.getFriendlyColour(player.value.colour.value))?.alias;

  if (existsV) {
    return existsV;
  }

  return colourStore.coloursConfig![0].alias;
}

onMounted(() => {
  const modalEl = document.getElementById("colourOverride")!;

  modalEl.addEventListener('hidden.bs.modal', () => {
    emit('onColourOverrideCancelled');
  });

  //@ts-ignore
  modal.value = new bootstrap.Modal(modalEl);
  //@ts-ignore
  modal.value.show();
  currentColour.value = ensureExists(colourStore.getColourForPlayer(game.value, props.playerId)!.alias);
});
</script>

<style scoped>
.colour-override-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.override-current-colour {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
</style>
