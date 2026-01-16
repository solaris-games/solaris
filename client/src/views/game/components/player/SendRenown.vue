<template>
<div class="pt-2 pb-2">
  <div class="col-12">
    <form-error-list v-bind:errors="errors"/>
  </div>

  <form class="row">
    <div class="col-7">
      <p class="mb-2"><span class="text-warning">{{userPlayer.renownToGive == null ? 0 : userPlayer.renownToGive}} Renown</span> to distribute.</p>
    </div>
    <div class="col-5">
      <div class="d-grid gap-2">
        <button type="button" class="btn btn-success" @click="confirmAwardRenown" :disabled="isAwardingRenown || !userPlayer.renownToGive"><i class="fas fa-heart"></i> Award Renown</button>
      </div>
    </div>
  </form>
</div>
</template>

<script setup lang="ts">
import { inject, ref, computed } from 'vue';
import { useStore } from 'vuex';
import FormErrorList from '../../../components/FormErrorList.vue'
import type {Game, Player} from "@/types/game";
import {extractErrors, formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import {sendRenown} from "@/services/typedapi/trade";

const props = defineProps<{
  player: Player,
  userPlayer: Player,
}>();

const emit = defineEmits<{
  onRenownSent: [amount: number],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const game = computed<Game>(() => store.state.game);
const isHistoricalMode = useIsHistoricalMode(store);

const errors = ref<string[]>([]);
const isAwardingRenown = ref(false);

const confirmAwardRenown = async () => {
  errors.value = [];
  isAwardingRenown.value = true;

  const response = await sendRenown(httpClient)(game.value._id, props.player._id, 1);
  if (isOk(response)) {
    toast.default(`Sent ${1} renown to ${props.player.alias}.`);

    props.userPlayer.renownToGive -= 1;

    emit('onRenownSent', 1);
  } else {
    console.error(formatError(response));
    errors.value = extractErrors(response);
  }

  isAwardingRenown.value = false;
};

</script>

<style scoped>
</style>
