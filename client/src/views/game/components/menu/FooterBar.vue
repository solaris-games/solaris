<template>
<div class="container-fluid header-bar-bg pt-2 pb-2 footer-bar">
    <div class="row g-0">
        <div class="col" v-if="!userPlayer && gameIsJoinable">
          <button class="btn" v-on:click="setMenuState({ state: 'welcome' })">
            <i class="fas fa-handshake"></i>
          </button>
        </div>
        <div class="col" v-if="userPlayer">
          <button class="btn" @click="panToHomeStar()">
            <i class="fas fa-home"></i>
          </button>
        </div>
        <div class="col" v-if="userPlayer">
          <button class="btn" v-on:click="setMenuState({ state: 'research' })">
            <i class="fas fa-flask"></i>
          </button>
        </div>
        <div class="col">
          <button class="btn" v-on:click="setMenuState({ state: 'galaxy', menu: undefined })">
            <i class="fas fa-sun"></i>
          </button>
        </div>
        <div class="col" v-if="isLoggedIn && !isDarkModeExtra && !isDataCleaned && (gameIsInProgress || gameIsFinished)">
          <button class="btn" v-on:click="setMenuState({ state: 'intel' })">
            <i class="fas fa-chart-line"></i>
          </button>
        </div>
        <div class="col">
          <hamburger-menu :dropType="'dropup'" />
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject, computed } from 'vue';
import type {Game} from "@/types/game";
import { useUserStore } from '@/stores/user';
import HamburgerMenu from "@/views/game/components/menu/HamburgerMenu.vue";
import { useGameStore } from "@/stores/game";
import type {MenuState} from "@/types/menu.ts";

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useGameStore();
const userStore = useUserStore();
const game = computed<Game>(() => store.game!);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const gameIsInProgress = computed(() => GameHelper.isGameInProgress(game.value));
const gameIsFinished = computed(() => GameHelper.isGameFinished(game.value));
const gameIsJoinable = computed(() => !gameIsInProgress.value && !gameIsFinished.value);
const isDarkModeExtra = computed(() => GameHelper.isDarkModeExtra(game.value));
const isDataCleaned = computed(() => game.value.state.cleaned);

const setMenuState = (state: MenuState) => {
  store.setMenuState(eventBus, state);
};

const panToHomeStar = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToUser, {});

  if (userPlayer.value) {
    emit('onOpenPlayerDetailRequested', userPlayer.value._id);
  }
};
</script>

<style scoped>
.pointer {
  cursor:pointer;
}

.col {
  text-align: center;
}
</style>
