<template>
<div class="container-fluid header-bar-bg pt-2 pb-2 footer-bar">
    <div class="row g-0">
        <div class="col" v-if="!userPlayer && gameIsJoinable">
          <button class="btn" v-on:click="setMenuState(MENU_STATES.WELCOME)">
            <i class="fas fa-handshake"></i>
          </button>
        </div>
        <div class="col" v-if="userPlayer">
          <button class="btn" @click="panToHomeStar()">
            <i class="fas fa-home"></i>
          </button>
        </div>
        <div class="col" v-if="userPlayer">
          <button class="btn" v-on:click="setMenuState(MENU_STATES.RESEARCH)">
            <i class="fas fa-flask"></i>
          </button>
        </div>
        <div class="col">
          <button class="btn" v-on:click="setMenuState(MENU_STATES.GALAXY)">
            <i class="fas fa-sun"></i>
          </button>
        </div>
        <div class="col" v-if="isLoggedIn && !isDarkModeExtra && !isDataCleaned && (gameIsInProgress || gameIsFinished)">
          <button class="btn" v-on:click="setMenuState(MENU_STATES.INTEL)">
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
import MENU_STATES from '../../../../services/data/menuStates'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject, computed } from 'vue';
import { useStore } from 'vuex';
import type {Game} from "@/types/game";
import { useUserStore } from '@/stores/user';
import HamburgerMenu from "@/views/game/components/menu/HamburgerMenu.vue";

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const store = useStore();
const userStore = useUserStore();
const game = computed<Game>(() => store.state.game);
const isLoggedIn = computed(() => userStore.isLoggedIn);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const gameIsInProgress = computed(() => GameHelper.isGameInProgress(game.value));
const gameIsFinished = computed(() => GameHelper.isGameFinished(game.value));
const gameIsJoinable = computed(() => !gameIsInProgress.value && !gameIsFinished.value);
const isDarkModeExtra = computed(() => GameHelper.isDarkModeExtra(game.value));
const isDataCleaned = computed(() => game.value.state.cleaned);

const setMenuState = (state: string, args = undefined) => {
  store.commit('setMenuState', { state, args });
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
