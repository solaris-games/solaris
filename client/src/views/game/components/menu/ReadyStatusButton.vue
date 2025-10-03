<template>
  <div class="btn-group">
    <button v-if="player.ready" class="btn btn-danger" :class="{'btn-sm':smallButtons}" @click="unconfirmReady()"
            title="Not ready"><i class="fas fa-times"></i></button>
    <button v-if="!player.ready" class="btn btn-success pulse" :class="{'btn-sm':smallButtons}" @click="confirmReady()"
            title="End your turn"><i class="fas fa-check"></i></button>
    <button v-if="!player.ready" type="button" :class="{'btn-sm':smallButtons}"
            class="btn btn-success dropdown-toggle dropdown-toggle-split pulse" data-bs-toggle="dropdown"
            aria-haspopup="true" aria-expanded="false">
      <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div v-if="!player.ready" class="dropdown-menu">
      <a class="dropdown-item" href="javascript:;" @click="confirmReady()">Ready</a>
      <a class="dropdown-item" href="javascript:;" @click="confirmReadyToCycle()">Ready to Cycle</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import {toastInjectionKey} from "@/util/keys";
import { inject, computed } from "vue";
import {httpInjectionKey, isOk} from "@/services/typedapi";
import { useStore } from 'vuex';
import {makeConfirm} from "@/util/confirm";
import {notReady, ready, readyToCycle} from "@/services/typedapi/game";

const props = defineProps<{
  smallButtons: boolean
}>();

const toast = inject(toastInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useStore();
const confirm = makeConfirm(store);

const player = computed(() => {
  return GameHelper.getUserPlayer(store.state.game)!;
});

const isTutorialGame = computed(() => {
  return GameHelper.isTutorialGame(store.state.game);
});

const confirmReady = async () => {
  if (!await confirm('End Turn', 'Are you sure you want to end your turn?')) {
    return;
  }

  const response = await ready(httpClient)(store.state.game._id);

  if (isOk(response)) {
    if (isTutorialGame.value) {
      toast.success(`You have confirmed your move, please wait while the game processes the tick.`);
    } else {
      toast.success(`You have confirmed your move, once all players are ready the game will progress automatically.`);
    }

    player.value.ready = true;
  } else {
    console.error(response);
  }
};

const confirmReadyToCycle = async () => {
  if (!await confirm('End Cycle', 'Are you sure you want to end your turn up to the end of the current galactic cycle?')) {
    return;
  }

  const response = await readyToCycle(httpClient)(store.state.game._id);

  if (isOk(response)) {
    if (isTutorialGame.value) {
      toast.success(`You have confirmed your move, please wait while the game processes the tick.`);
    } else {
      toast.success(`You have confirmed your move, once all players are ready the game will progress automatically.`);
    }

    player.value.ready = true;
    player.value.readyToCycle = true;
  } else {
    console.error(response);
  }
};

const unconfirmReady = async () => {
  const response = await notReady(httpClient)(store.state.game._id);

  if (isOk(response)) {
    player.value.ready = false;
    player.value.readyToCycle = false;
  } else {
    console.error(response);
  }
};
</script>

<style scoped>

</style>
