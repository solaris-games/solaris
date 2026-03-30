<template>
  <div class="sidebar-menu d-none d-md-block" :class="{'header-bar-bg':!isHistoricalMode,'bg-dark':isHistoricalMode}">
    <div class="sidebar-menu-top">
      <div v-if="!userPlayer && gameIsJoinable">
        <sidebar-menu-item :menuState="MENU_STATES.WELCOME" tooltip="Join Game" iconClass="fas fa-handshake" />
      </div>
      <div v-if="!userPlayer && !gameIsJoinable">
        <sidebar-menu-item :menuState="MENU_STATES.LEADERBOARD" tooltip="Leaderboard (Q)" iconClass="fas fa-users" />
      </div>
      <sidebar-menu-item :menuState="MENU_STATES.GALAXY" tooltip="Galaxy (G)" iconClass="fas fa-sun" />
      <div v-if="userPlayer">
        <sidebar-menu-item :menuState="MENU_STATES.LEADERBOARD" tooltip="Leaderboard (Q)" iconClass="fas fa-users" />
        <sidebar-menu-item :menuState="MENU_STATES.RESEARCH" tooltip="Research (R)" iconClass="fas fa-flask" />
        <sidebar-menu-item :menuState="MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE" tooltip="Bulk Upgrade (B)" iconClass="fas fa-money-bill" />
        <sidebar-menu-item v-if="isFormalAlliancesEnabled" :menuState="MENU_STATES.DIPLOMACY" tooltip="Diplomacy (D)" iconClass="fas fa-globe-americas" />
        <sidebar-menu-item v-if="isTradeEnabled" :menuState="MENU_STATES.LEDGER" tooltip="Ledger (L)" iconClass="fas fa-file-invoice-dollar" />
        <sidebar-menu-item :menuState="MENU_STATES.GAME_NOTES" tooltip="Notes (N)" iconClass="fas fa-book-open" />
      </div>
      <div v-if="isLoggedIn">
        <sidebar-menu-item :menuState="MENU_STATES.COMBAT_CALCULATOR" tooltip="Calculator (C)" iconClass="fas fa-calculator" />
        <sidebar-menu-item :menuState="MENU_STATES.RULER" tooltip="Ruler (V)" iconClass="fas fa-ruler" />
        <sidebar-menu-item v-if="!isDarkModeExtra && !isDataCleaned && (gameIsInProgress || gameIsFinished)" :menuState="MENU_STATES.INTEL" tooltip="Intel (I)" iconClass="fas fa-chart-line" />
        <sidebar-menu-item :menuState="MENU_STATES.STATISTICS" tooltip="Statistics" iconClass="fas fa-chart-bar" />
      </div>
    </div>

    <div class="sidebar-menu-bottom" v-if="canDisplayBottomBar">
      <sidebar-menu-item :menuState="MENU_STATES.OPTIONS" tooltip="Options (O)" iconClass="fas fa-cog" />
      <a :href="documentationUrl" target="_blank" title="How to Play"><i class="far fa-question-circle"></i></a>
      <router-link v-if="isLoggedIn" to="/game/active-games" title="My Games"><i class="fas fa-dice"></i></router-link>
      <a v-if="isLoggedIn" v-on:click="goToMainMenu()" title="Main Menu"><i class="fas fa-chevron-left"></i></a>
      <router-link v-if="!isLoggedIn" to="/" title="Log In"><i class="fas fa-sign-in-alt"></i></router-link>
      <router-link v-if="!isLoggedIn" to="/account/create" title="Register"><i class="fas fa-user-plus"></i></router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../services/gameHelper'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import router from '../../../../router'
import MENU_STATES from '../../../../services/data/menuStates'
import SidebarMenuItem from './SidebarMenuItem.vue'
import type {Game} from "@/types/game";
import {configInjectionKey} from "@/config";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import { useUserStore } from '@/stores/user';

const store = useStore();
const userStore = useUserStore();

const isHistoricalMode = useIsHistoricalMode(store);

const config = inject(configInjectionKey)!;

const game = computed<Game>(() => store.game);

const setMenuState = (state: string, args: any) => {
  store.commit('setMenuState', {
    state,
    args
  });
};

const goToMainMenu = () => {
  router.push({ name: 'main-menu' });
};

const gameIsJoinable = computed(() => {
  return userStore.isLoggedIn && GameHelper.gameHasOpenSlots(game.value);
});

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

const isLoggedIn = computed(() => userStore.isLoggedIn);

const isDarkModeExtra = computed(() => GameHelper.isDarkModeExtra(game.value));

const isDataCleaned = computed(() => store.game.state.cleaned);

const isFormalAlliancesEnabled = computed(() => DiplomacyHelper.isFormalAlliancesEnabled(game.value));

const isTradeEnabled = computed(() => GameHelper.isTradeEnabled(game.value));

const documentationUrl = computed(() => config.appDocumentationUrl);

const canDisplayBottomBar = computed(() => window.innerHeight >= 750);

const gameIsInProgress = computed(() => GameHelper.isGameInProgress(game.value));

const gameIsFinished = computed(() => GameHelper.isGameFinished(game.value));
</script>

<style scoped>
.sidebar-menu {
  position:absolute;
  padding-top: 45px;
  height: 100%;
}

.sidebar-menu-top, .sidebar-menu-bottom {
  width: 50px;
}

.sidebar-menu-bottom {
  position: absolute;
  bottom: 0;
}

a {
  display: block;
  text-align: center;
  font-size: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 12px;
  padding-right: 12px;
  cursor: pointer;
  color: white !important;
}

a:hover {
  color: #375a7f !important;
}
</style>
