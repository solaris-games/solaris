<template>
  <div class="row mb-1 bg-dark pt-2 pb-2" v-if="game.settings.general.isGameAdmin">
    <loading-spinner :loading="isLoading"/>

    <div class="col">
      <button class="btn btn-danger" v-if="!game.state.startDate"
              @click="deleteGame">Delete Game
      </button>
      <button class="btn btn-warning" v-if="canModifyPauseState && !game.state.paused" @click="pauseGame">Pause
        Game
      </button>
      <button class="btn btn-warning" v-if="canModifyPauseState && game.state.paused" @click="resumeGame">Resume
        Game
      </button>
      <button class="btn btn-danger ms-1" v-if="!game.state.startDate"
              @click="forceStartGame(false)">Force start Game
      </button>
      <button class="btn btn-danger ms-1" v-if="!game.state.startDate"
              @click="forceStartGame(true)">Force start Game (keep slots open)
      </button>
      <button class="btn btn-warning ms-1"
              v-if="game.state.startDate && !game.state.endDate && !game.state.forceTick"
              @click="fastForwardGame">Fast Forward Game
      </button>

      <view-collapse-panel @onToggle="togglePlayerControl" title="Player Control">
        <game-player-control v-if="fullGame" :game="fullGame" @onGameModified="loadFullGame"/>
      </view-collapse-panel>

      <div v-if="errors?.length" class="alert alert-danger mt-2" role="alert">
        <p class="text-danger" v-for="error in errors">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../components/LoadingSpinner.vue'
import GameHelper from '../../services/gameHelper'
import ViewCollapsePanel from '../components/ViewCollapsePanel.vue'
import GamePlayerControl from './GamePlayerControl.vue';
import router from "../../router";
import { ref, inject, computed, type Ref } from 'vue';
import type { GameInfoDetail, GameGalaxy, GameGalaxyDetail } from '@solaris-common';
import { extractErrors, formatError, httpInjectionKey, isOk } from '@/services/typedapi';
import { toastInjectionKey } from '@/util/keys';
import { detailGalaxy, fastForward, forceStart, pause, deleteGame as delGame } from '@/services/typedapi/game';
import { useStore } from 'vuex';
import { makeConfirm } from '@/util/confirm';

const props = defineProps<{
  game: GameInfoDetail<string>,
}>();

const emit = defineEmits<{
  onGameModified: [],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const confirm = makeConfirm(store);

const isLoading = ref(false);
const errors: Ref<string[]> = ref([]);
const fullGame: Ref<GameGalaxyDetail<string> | null> = ref(null);

const canModifyPauseState = computed(() => {
  return props.game.settings.general.isGameAdmin
        && GameHelper.isGameStarted(props.game)
        && !GameHelper.isGamePendingStart(props.game)
        && !GameHelper.isGameFinished(props.game);
});

const loadFullGame = async () => {
  const response = await detailGalaxy(httpClient)(props.game._id);

  if (isOk(response)) {
    fullGame.value = response.data;
  } else {
    console.error(formatError(response));
  }
};

const togglePlayerControl = async (collapsed: boolean) => {
  if (!collapsed && !fullGame.value) {
    await loadFullGame();
  }
};

const pauseGame = async () => {
  if (await confirm('Pause game', 'Are you sure you want to pause this game?')) {
    isLoading.value = true;

    const response = await pause(httpClient)(props.game._id, true);

    if (isOk(response)) {
      toast.success(`The game has been paused.`);
    } else {
      console.error(formatError(response));
      errors.value = extractErrors(response);
    }

    emit('onGameModified');
    isLoading.value = false;
  }
};

const resumeGame = async () => {
  if (await confirm('Resume game', 'Are you sure you want to resume this game?')) {
    isLoading.value = true;

    const response = await pause(httpClient)(props.game._id, false);

    if (isOk(response)) {
      toast.success(`The game has been resumed.`);
    } else {
      console.error(formatError(response));
      errors.value = extractErrors(response);
    }

    emit('onGameModified');
    isLoading.value = false;
  }
};

const fastForwardGame = async () => {
  if (await confirm('Fast forward game', 'Are you sure you want to fast-forward this game?')) {
    isLoading.value = true;

    const response = await fastForward(httpClient)(props.game._id);

    if (isOk(response)) {
      toast.success(`The game has been fast-forwarded.`);
    } else {
      console.error(formatError(response));
      errors.value = extractErrors(response);
    }

    emit('onGameModified');
    isLoading.value = false;
  }
};

const forceStartGame = async (withOpenSlots: boolean) => {
  if (await confirm('Force start game', 'Are you sure you want to force-start this game?')) {
    isLoading.value = true;

    const response = await forceStart(httpClient)(props.game._id, withOpenSlots);

    if (isOk(response)) {
      toast.success(`The game has been force-started.`);
    } else {
      console.error(formatError(response));
      errors.value = extractErrors(response);
    }

    emit('onGameModified');
    isLoading.value = false;
  }
};

const deleteGame = async () => {
    if (await confirm('Delete game', 'Are you sure you want to delete this game?')) {
    isLoading.value = true;

    const response = await delGame(httpClient)(props.game._id);

    if (isOk(response)) {
      toast.success(`The game has been deleted.`);

      router.push({name: 'main-menu'})
    } else {
      console.error(formatError(response));
      errors.value = extractErrors(response);
    }

    emit('onGameModified');
    isLoading.value = false;
    }
};
</script>
<style scoped></style>
