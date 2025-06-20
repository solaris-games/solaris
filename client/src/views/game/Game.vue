<template>
  <div id="gameRoot">
    <logo v-if="!hasGame"></logo>

    <loading-spinner :loading="!hasGame" />

    <div v-if="hasGame">
      <span class="d-none">{{ gameId }}</span>

      <colour-override-dialog v-if="colourOverride" :playerId="colourOverride.playerId"
        @onColourOverrideCancelled="onColourOverrideCancelled" @onColourOverrideConfirmed="onColourOverrideConfirmed" />

      <game-container @onStarClicked="onStarClicked" @onStarRightClicked="onStarRightClicked"
        @onCarrierClicked="onCarrierClicked" @onCarrierRightClicked="onCarrierRightClicked"
        @onObjectsClicked="onObjectsClicked" />

      <main-bar @onPlayerSelected="onPlayerSelected" @onReloadGameRequested="reloadGame"
        @onViewColourOverrideRequested="onViewColourOverrideRequested" />

      <chat @onOpenPlayerDetailRequested="onPlayerSelected"
        @onOpenReportPlayerRequested="onOpenReportPlayerRequested" />

    </div>
  </div>
</template>

<script setup lang="ts">
import Logo from '../components/Logo.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import GameContainer from './components/GameContainer.vue'
import MENU_STATES from '../../services/data/menuStates'
import MainBar from './components/menu/MainBar.vue'
import Chat from './components/inbox/Chat.vue'
import GameApiService from '../../services/api/game'
import GameHelper from '../../services/gameHelper'
import AudioService from '../../game/audio'
import gameHelper from '../../services/gameHelper'
import ColourOverrideDialog from "./components/player/ColourOverrideDialog.vue";
import { eventBusInjectionKey } from '../../eventBus'
import { inject, ref, computed, onMounted, onUnmounted, onBeforeUnmount, type Ref } from 'vue';
import { playerClientSocketEmitterInjectionKey } from '../../sockets/socketEmitters/player'
import GameEventBusEventNames from '../../eventBusEventNames/game'
import router from '../../router'
import { withMessages } from "../../util/messages";
import { userClientSocketEmitterInjectionKey } from "@/sockets/socketEmitters/user";
import { formatError, httpInjectionKey, isOk } from '@/services/typedapi'
import {getSettings} from "@/services/typedapi/user";
import { useStore, type Store } from 'vuex';
import type {State} from "@/store";
import {toastInjectionKey} from "@/util/keys";
import { useRoute } from 'vue-router';
import type {ObjectClicked} from "@/eventBusEventNames/map";

const store: Store<State> = useStore();

const emit = defineEmits<{
  onPlayerSelected: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const playerClientSocketEmitter = inject(playerClientSocketEmitterInjectionKey)!;
const userClientSockerEmitter = inject(userClientSocketEmitterInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const route = useRoute();

const polling: Ref<number | null> = ref(null);
const ticking = ref(false);
const colourOverride: Ref<{ playerId: string } | null> = ref(null);

const gameId = computed(() => store.state.game._id);

const hasGame = computed(() => Boolean(store.state.game));

const isLoggedIn = computed(() => Boolean(store.state.userId));

const isHistorical = computed(() => store.state.tick !== store.state.game.state.tick);

const onColourOverrideConfirmed = () => {
  colourOverride.value = null;
};

const onColourOverrideCancelled = () => {
  colourOverride.value = null;
};

const onViewColourOverrideRequested = (e: string) => {
  colourOverride.value = { playerId: e };
};

const onStarClicked = (starId: string) => {
  store.commit('setMenuState', {
    state: MENU_STATES.STAR_DETAIL,
    args: starId,
  });

  AudioService.click();
};

const onStarRightClicked = (starId: string) => {
  const star = GameHelper.getStarById(store.state.game, starId)!;
  const owningPlayer = GameHelper.getStarOwningPlayer(store.state.game, star);

  if (owningPlayer) {
    onPlayerSelected(owningPlayer._id);
  }

  AudioService.click();
};

const onCarrierClicked = (carrierId: string) => {
  store.commit('setMenuState', {
    state: MENU_STATES.CARRIER_DETAIL,
    args: carrierId,
  });

  AudioService.click();
};

const onCarrierRightClicked = (carrierId: string) => {
  const carrier = GameHelper.getCarrierById(store.state.game, carrierId)!;
  const owningPlayer = GameHelper.getCarrierOwningPlayer(store.state.game, carrier);

  if (owningPlayer) {
    onPlayerSelected(owningPlayer._id);
  }

  AudioService.click();
};

const onObjectsClicked = (e: ObjectClicked[]) => {
  store.commit('setMenuState', {
    state: MENU_STATES.MAP_OBJECT_SELECTOR,
    args: e,
  });

  AudioService.open();
};

const onPlayerSelected = (playerId: string) => {
  store.commit('setMenuState', {
    state: MENU_STATES.PLAYER,
    args: playerId,
  });

  emit('onPlayerSelected', playerId);
};

const onOpenReportPlayerRequested = (playerId: string) => {
  store.commit('setMenuState', {
    state: MENU_STATES.REPORT_PLAYER,
    args: playerId,
  });
};

const attemptLogin = () => {
  if (store.state.userId) {
    return;
  }

  store.dispatch('verify');
};

const reloadSettings = async () => {
  const response = await getSettings(httpClient)();

  if (isOk(response)) {
    store.commit('setSettings', response.data) // Persist to storage
  } else {
    console.error(formatError(response));
  }
};

const reloadGame = async () => {
  try {
    const galaxyResponse = await GameApiService.getGameGalaxy(route.query.id);

    // Make sure the player is still in the current game, they may have quickly
    // switched to another game.
    if (route.query.id === galaxyResponse.data._id) {
      store.commit('setGame', galaxyResponse.data); // Persist to storage
      store.commit('setTick', galaxyResponse.data.state.tick);
      store.commit('setProductionTick', galaxyResponse.data.state.productionTick);

      document.title = galaxyResponse.data.settings.general.name + ' - Solaris';
    }
  } catch (err) {
    console.error(err);

    toast.error('Game failed to load');

    router.push({ name: 'main-menu' });
  }
};

const reloadGameCheck = async () => {
  if (!isLoggedIn.value || ticking.value) {
    return
  }

  // Check if the next tick date has passed, if so check if the server has finished the game tick.
  // Alternatively if the game is set to 10s ticks then always check.
  const canTick = store.state.game.settings.gameTime.speed <= 10 || gameHelper.canTick(store.state.game);

  if (canTick) {
    ticking.value = true;

    try {
      const response = await GameApiService.getGameState(store.state.game._id);

      if (response.status === 200) {
        if (store.state.tick < response.data.state.tick) {
          // If the user is currently using the time machine then only set the state variables.
          // Otherwise reload the current game tick.
          if (isHistorical.value) {
            store.commit('setTick', response.data.state.tick)
            store.commit('setProductionTick', response.data.state.productionTick)
          } else {
            await reloadGame();
          }

          eventBus.emit(GameEventBusEventNames.OnGameTick);

          toast.success(`The game has ticked. Cycle ${response.data.state.productionTick}, Tick ${response.data.state.tick}.`);

          AudioService.download();
        }
      }
    } catch (e) {
      console.error(e)
    }

    ticking.value = false;
  }
};

withMessages();

AudioService.loadStore(store);

store.commit('clearGame');

onMounted(async () => {
  attemptLogin();
  await reloadSettings();
  await reloadGame();

  const userPlayer = GameHelper.getUserPlayer(store.state.game);

  userClientSockerEmitter.emitJoined();

  playerClientSocketEmitter.emitGameRoomJoined({
    gameId: store.state.game._id,
    playerId: userPlayer?._id
  });

// If the user is in the game then display the leaderboard.
// Otherwise show the welcome screen if there are empty slots.

  if (userPlayer && !userPlayer.defeated) {
    if (GameHelper.isTutorialGame(store.state.game)) {
      store.commit('setMenuState', { state: MENU_STATES.TUTORIAL })
    } else {
      store.commit('setMenuState', { state: MENU_STATES.LEADERBOARD })
    }
  } else {
    if (store.state.userId && GameHelper.gameHasOpenSlots(store.state.game)) {
      store.commit('setMenuState', { state: MENU_STATES.WELCOME })
    } else {
      store.commit('setMenuState', { state: MENU_STATES.LEADERBOARD }) // Assume the user is spectating.
    }
  }

  const reloadGameCheckInterval = 1000;
  polling.value = setInterval(reloadGameCheck, reloadGameCheckInterval);

  await store.dispatch('loadSpecialistData', store.state.game._id);
  await store.dispatch('loadColourData');
});

onBeforeUnmount(() => {
  polling.value && clearInterval(polling.value);
});

onUnmounted(() => {
  playerClientSocketEmitter.emitGameRoomLeft({
    gameId: store.state.game._id,
    playerId: userPlayer?._id
  });

  store.commit('clearGame');

  document.title = 'Solaris'
});
</script>

<style scoped></style>
