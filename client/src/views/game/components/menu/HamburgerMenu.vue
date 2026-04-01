<template>
  <div class="dropdown-container" :class="dropType || 'dropleft'">
    <button class="btn" :class="buttonClass" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown"
            aria-haspopup="true" aria-expanded="false">
      <i class="fas fa-bars"></i>
    </button>
    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
      <div class="ps-2">
        <button class="btn btn-primary btn-sm me-1 mb-1" @click="fitGalaxy" title="Fit Galaxy (Z)"><i
          class="fas fa-compass"></i></button>
        <button class="btn btn-primary btn-sm me-1 mb-1" @click="zoomIn()" title="Zoom In (+)"><i
          class="fas fa-search-plus"></i></button>
        <button class="btn btn-primary btn-sm me-1 mb-1" @click="zoomOut()" title="Zoom Out (-)"><i
          class="fas fa-search-minus"></i></button>
        <button v-if="userPlayer" class="btn btn-primary btn-sm me-1 mb-1" @click="panToHomeStar()" title="Home (H)"><i
          class="fas fa-home"></i></button>
        <div>
          <button v-if="isLoggedIn" class="btn btn-primary btn-sm me-1 mb-1"
                  @click="setMenuState({ state: 'combatCalculator' })" title="Calculator (C)"><i
            class="fas fa-calculator"></i></button>
          <button v-if="isLoggedIn" class="btn btn-primary btn-sm me-1 mb-1" @click="setMenuState({ state: 'ruler' })"
                  title="Ruler (V)"><i class="fas fa-ruler"></i></button>
          <button v-if="userPlayer && !userPlayer.defeated" class="btn btn-primary btn-sm me-1 mb-1"
                  @click="setMenuState({ state: 'bulkInfrastructureUpgrade' })" title="Bulk Upgrade (B)"><i
            class="fas fa-money-bill"></i></button>
          <button class="btn btn-primary btn-sm me-1 mb-1" @click="reloadPage" title="Reload Game"><i
            class="fas fa-sync"></i></button>
        </div>
      </div>
      <div v-if="userPlayer" class="dropdown-divider"></div>
      <button v-if="userPlayer" class="dropdown-item" :class="isCustomColoursEnabled ? 'active' : null"
              v-on:click="toggleCustomColours">
        <i class="fas fa-paint-brush me-2"/>Custom colours
      </button>
      <div class="dropdown-divider"></div>
      <div v-if="!userPlayer && gameIsJoinable">
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'welcome' })"><i class="fas fa-handshake me-2"></i>Welcome</a>
      </div>
      <div v-if="!userPlayer && !gameIsJoinable">
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'leaderboard' })" title="Leaderboard (Q)"><i
          class="fas fa-users me-2"></i>Leaderboard</a>
      </div>
      <a class="dropdown-item" v-on:click="setMenuState({ state: 'galaxy', menu: undefined })" title="Galaxy (G)"><i
        class="fas fa-sun me-2"></i>Galaxy</a>
      <div v-if="userPlayer">
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'leaderboard' })" title="Leaderboard (Q)"><i
          class="fas fa-users me-2"></i>Leaderboard</a>
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'research' })" title="Research (R)"><i
          class="fas fa-flask me-2"></i>Research</a>
        <a class="dropdown-item d-lg-none" v-on:click="store.setMenuStateChat({ state: 'inbox' })" title="Inbox (M)"
           v-if="!isTutorialGame"><i class="fas fa-comments me-2"></i>Inbox</a>
        <a class="dropdown-item d-none d-lg-inline-block" v-on:click="onMenuChatSidebarRequested()" title="Inbox (M)"
           v-if="!isTutorialGame"><i class="fas fa-comments me-2"></i>Inbox</a>
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'diplomacy' })" title="Diplomacy (D)"
           v-if="isFormalAlliancesEnabled"><i class="fas fa-globe-americas me-2"></i>Diplomacy</a>
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'ledger' })" title="Ledger (L)" v-if="isTradeEnabled"><i
          class="fas fa-file-invoice-dollar me-2"></i>Ledger</a>
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'statistics' })" title="Statistics"><i
          class="fas fa-chart-bar me-2"></i>Statistics</a>
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'gameNotes' })" title="Notes (N)"><i
          class="fas fa-book-open me-2"></i>Notes</a>
        <a class="dropdown-item" v-on:click="setMenuState({ state: 'spectators' })" title="Spectators"
           v-if="isSpectatingEnabled"><i class="fas fa-people-arrows me-2"></i>Spectators</a>
      </div>
      <a
        v-if="isLoggedIn && !isDataCleaned && (!(isDarkModeExtra && gameIsInProgress)) && (gameIsInProgress || gameIsFinished)"
        class="dropdown-item" v-on:click="setMenuState({ state: 'intel' })" title="Intel (I)"><i
        class="fas fa-chart-line me-2"></i>Intel</a>
      <a v-if="isLoggedIn" class="dropdown-item" v-on:click="setMenuState({ state: 'options' })" title="Options (O)"><i
        class="fas fa-cog me-2"></i>Options</a>
      <a :href="documentationUrl" class="dropdown-item" target="_blank"><i class="far fa-question-circle me-2"></i>How
        to Play</a>
      <router-link v-if="isLoggedIn" to="/game/active-games" class="dropdown-item"><i class="fas fa-dice me-2"></i>My
        Games
      </router-link>
      <a v-if="isLoggedIn" class="dropdown-item" v-on:click="goToMainMenu()"><i class="fas fa-chevron-left me-2"></i>Main
        Menu</a>
      <router-link v-if="!isLoggedIn" to="/" class="dropdown-item"><i class="fas fa-sign-in-alt me-2"></i>Log In
      </router-link>
      <router-link v-if="!isLoggedIn" to="/account/create" class="dropdown-item"><i class="fas fa-user-plus me-2"></i>Register
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import router from '../../../../router'
import {inject, computed} from 'vue';
import {eventBusInjectionKey} from '@/eventBus'
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {configInjectionKey} from "@/config";
import type {Game} from "@/types/game";
import { useUserStore } from '@/stores/user';
import { useColourStore } from '@/stores/colour';
import { useGameStore } from "@/stores/game"
import type {MenuState} from "@/types/menu";

const props = defineProps<{
  buttonClass?: string,
  dropType: string,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const config = inject(configInjectionKey)!;

const store = useGameStore();
const userStore = useUserStore();
const colourStore = useColourStore();
const game = computed<Game>(() => store.game!);

const setMenuState = (state: MenuState) => {
  store.setMenuState(state);
};

const onMenuChatSidebarRequested = () => {
  store.setMenuStateChat({ state: 'inbox' })
};

const goToMainMenu = () => {
  router.push({name: 'main-menu'});
};

const fitGalaxy = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandFitGalaxy, {});
};

const zoomIn = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomIn, {});
};

const zoomOut = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomOut, {});
};

const panToHomeStar = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToUser, {});

  if (userPlayer.value) {
    emit('onOpenPlayerDetailRequested', userPlayer.value._id);
  }
};

const reloadPage = () => {
  location.reload();
};

const toggleCustomColours = () => {
  colourStore.setColourOverride(!isCustomColoursEnabled.value, eventBus, store.game, store.settings);
};

const gameIsInProgress = computed(() => GameHelper.isGameInProgress(game.value));

const gameIsFinished = computed(() => GameHelper.isGameFinished(game.value));

const gameIsJoinable = computed(() => userStore.isLoggedIn && GameHelper.gameHasOpenSlots(game.value));

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

const isLoggedIn = computed(() => userStore.isLoggedIn);

const isDarkModeExtra = computed(() => GameHelper.isDarkModeExtra(game.value));

const isDataCleaned = computed(() => store.game!.state.cleaned);

const documentationUrl = computed(() => config.appDocumentationUrl);

const isFormalAlliancesEnabled = computed(() => DiplomacyHelper.isFormalAlliancesEnabled(game.value));

const isTradeEnabled = computed(() => GameHelper.isTradeEnabled(game.value));

const isTutorialGame = computed(() => GameHelper.isTutorialGame(game.value));

const isSpectatingEnabled = computed(() => GameHelper.isSpectatingEnabled(game.value));

const isCustomColoursEnabled = computed(() => colourStore.colourOverride);
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
