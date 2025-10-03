<template>
  <div class="btn-group" v-if="isGameInProgress && !userPlayer.defeated">
    <button class="btn btn-danger btn-sm" @click="doConcedeDefeat(false)" title="Concede Defeat">
      <i class="fas fa-skull-crossbones"></i> {{ isTutorialGame ? 'Quit Tutorial' : 'Concede Defeat' }}
    </button>
    <button type="button" class="btn btn-sm btn-danger dropdown-toggle dropdown-toggle-split pulse"
            data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-if="!isTutorialGame">
      <span class="sr-only">Toggle Dropdown</span>
    </button>
    <div class="dropdown-menu" v-if="!isTutorialGame">
      <a class="dropdown-item" href="javascript:;" @click="doConcedeDefeat(false)">Concede Defeat</a>
      <a class="dropdown-item" href="javascript:;" @click="doConcedeDefeat(true)">Concede Defeat + Open Slot</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '../../../../router';
import GameHelper from '../../../../services/gameHelper';
import AudioService from '../../../../game/audio';
import { ref, computed, inject } from 'vue';
import { useStore } from 'vuex';
import type { Store } from 'vuex';
import type { State } from '../../../../store';
import { toastInjectionKey } from '../../../../util/keys';
import { makeConfirm } from "@/util/confirm";
import {httpInjectionKey, isOk} from "@/services/typedapi";
import type { Game } from '../../../../types/game';
import { concedeDefeat } from '@/services/typedapi/game';

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store: Store<State> = useStore();
const confirm = makeConfirm(store);
const game = computed<Game>(() => store.state.game);

const isConcedingDefeat = ref(false);

const userPlayer = computed(() => GameHelper.getUserPlayer(store.state.game)!);
const isTutorialGame = computed(() => GameHelper.isTutorialGame(store.state.game));
const isGameInProgress = computed(() => GameHelper.isGameStarted(store.state.game) && !GameHelper.isGameFinished(store.state.game));

const doConcedeDefeat = async (openSlot: boolean) => {
  let message = 'Are you sure you want to concede defeat in this game?';

  if (isTutorialGame.value) {
    message = 'Are you sure you want to exit the tutorial? All progress will be lost.';
  }

  if (openSlot) {
    message += ' Your slot will be open for another player to fill.';
  }

  if (!await confirm('Concede Defeat', message)) {
    return;
  }

  isConcedingDefeat.value = true;

  try {
    const response = await concedeDefeat(httpClient)(game.value._id, openSlot);

    if (isOk(response)) {
      AudioService.quit();

      if (!isTutorialGame.value) {
        toast.error(`You have conceded defeat, better luck next time.`);
      }

      router.push({name: 'main-menu'});
    }
  } catch (err) {
    console.error(err);
  }

  isConcedingDefeat.value = false;
};
</script>

<style scoped>

</style>
