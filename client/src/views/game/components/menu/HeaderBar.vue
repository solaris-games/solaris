<template>
<div class="container-fluid header-bar" :class="{'header-bar-bg': !isHistoricalMode,'bg-dark': isHistoricalMode}">
    <div class="row pt-2 pb-2 g-0">
        <div class="col-auto d-none d-md-inline-block me-5 pointer pt-1" v-on:click="setMenuState(MENU_STATES.LEADERBOARD, null)">
            <server-connection-status/>

            {{game.settings.general.name}}
        </div>
        <div class="col-auto pt-1 me-3">
            <span class="pointer" v-if="gameIsPaused" v-on:click="setMenuState(MENU_STATES.LEADERBOARD, null)">{{getGameStatusText}}</span>
            <span class="pointer" v-if="gameIsInProgress" v-on:click="setMenuState(MENU_STATES.LEADERBOARD, null)" title="Next production tick"><i class="fas fa-clock"></i> {{timeRemaining}}</span>
            <span class="pointer" v-if="gameIsPendingStart" v-on:click="setMenuState(MENU_STATES.LEADERBOARD, null)" title="Game starts in"><i class="fas fa-stopwatch"></i> {{timeRemaining}}</span>
        </div>
        <div class="col-auto pt-1" v-if="isLoggedIn && isTimeMachineEnabled && !isDataCleaned && !gameIsWaitingForPlayers">
          <tick-selector />
        </div>
        <div class="col text-end pt-1">
            <span v-if="userPlayer" class="pointer me-2" title="Total credits" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE, null)">
                <i class="fas fa-dollar-sign text-success"></i> {{userPlayer.credits}}
            </span>

            <span class="pointer me-2" v-if="userPlayer && isSpecialistsCurrencyCreditsSpecialists" title="Total specialist tokens" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE, null)">
                <i class="fas fa-coins text-success"></i> {{userPlayer.creditsSpecialists}}
            </span>

            <research-progress class="d-none d-lg-inline-block me-2" v-if="userPlayer" @onViewResearchRequested="onViewResearchRequested"/>
        </div>
        <div class="col-auto text-end pointer pt-1" v-if="userPlayer?.stats" @click="onViewBulkUpgradeRequested">
            <span class="d-none d-lg-inline-block me-2" title="Total economy">
                <i class="fas fa-money-bill-wave text-success"></i> {{userPlayer.stats.totalEconomy}}
            </span>
            <span class="d-none d-lg-inline-block me-2" title="Total industry">
                <i class="fas fa-tools text-warning"></i> {{userPlayer.stats.totalIndustry}}
            </span>
            <span class="d-none d-lg-inline-block me-2" title="Total science">
                <i class="fas fa-flask text-info"></i> {{userPlayer.stats.totalScience}}
            </span>
        </div>
        <div class="col-auto">
            <button class="btn btn-sm btn-warning" v-if="isTutorialGame" @click="setMenuState(MENU_STATES.TUTORIAL, null)">
              <i class="fas fa-user-graduate"></i>
              <span class="d-none d-md-inline-block ms-1">Tutorial</span>
            </button>

            <button class="btn btn-sm btn-success ms-1" v-if="!userPlayer && gameIsJoinable" @click="setMenuState(MENU_STATES.WELCOME, null)">Join Now</button>

            <ready-status-button :smallButtons="true" v-if="!isHistoricalMode && userPlayer && isTurnBasedGame && canEndTurn && !userPlayer.defeated" class="ms-1" />

            <button class="btn btn-sm ms-1 d-lg-none" v-if="userPlayer && !isTutorialGame" :class="{'btn-outline-info': !unreadMessages, 'btn-warning': unreadMessages}" v-on:click="setMenuState(MENU_STATES.INBOX, null)" title="Inbox (M)">
                <i class="fas fa-comments"></i> <span class="ms-1" v-if="unreadMessages">{{unreadMessages}}</span>
            </button>

            <button class="btn btn-sm ms-1" v-if="userPlayer" :class="{'btn-outline-info': !unreadEvents, 'btn-warning': unreadEvents}" v-on:click="setMenuState(MENU_STATES.EVENT_LOG, null)" title="Event Log (E)">
                <i class="fas fa-inbox"></i> <span class="ms-1" v-if="unreadEvents">{{unreadEvents}}</span>
            </button>

            <hamburger-menu class="ms-1 d-none d-sm-inline-block" :buttonClass="'btn-sm btn-info'" :dropType="'dropleft'" />

            <button class="btn btn-sm btn-info ms-1 d-none d-sm-inline-block" type="button" @click="goToMyGames()">
                <i class="fas fa-chevron-left"></i>
            </button>
        </div>
    </div>
</div>
</template>

<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper'
import router from '../../../../router'
import MENU_STATES from '../../../../services/data/menuStates'
import KEYBOARD_SHORTCUTS from '../../../../services/data/keyboardShortcuts'
import ServerConnectionStatus from './ServerConnectionStatus.vue'
import ResearchProgress from './ResearchProgress.vue'
import EventApiService from '../../../../services/api/event'
import HamburgerMenu from './HamburgerMenu.vue'
import TickSelector from './TickSelector.vue'
import ReadyStatusButton from './ReadyStatusButton.vue'
import { eventBusInjectionKey } from '../../../../eventBus'
import { inject, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStore } from 'vuex';
import GameEventBusEventNames from '../../../../eventBusEventNames/game'
import PlayerEventBusEventNames from '../../../../eventBusEventNames/player'
import UserEventBusEventNames from "../../../../eventBusEventNames/user";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {getUnreadCount} from "@/services/typedapi/conversation";
import {toastInjectionKey} from "@/util/keys";
import type {TradeEventTechnology} from "@solaris-common";
import {useIsHistoricalMode} from "@/util/reactiveHooks";
import type {Game} from "@/types/game";

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const isHistoricalMode = useIsHistoricalMode(store);
const game = computed<Game>(() => store.state.game);

const gameIsPendingStart = computed(() => GameHelper.isGamePendingStart(game.value));
const gameIsInProgress = computed(() => GameHelper.isGameInProgress(game.value));
const gameIsFinished = computed(() => GameHelper.isGameFinished(game.value));
const gameIsJoinable = computed(() => !gameIsInProgress.value && !gameIsFinished.value);
const gameIsWaitingForPlayers = computed(() => GameHelper.isGameWaitingForPlayers(game.value));
const getGameStatusText = computed(() => GameHelper.getGameStatusText(game.value));
const isTurnBasedGame = computed(() => GameHelper.isTurnBasedGame(game.value));
const isTimeMachineEnabled = computed(() => game.value.settings.general.timeMachine === 'enabled');
const isSpecialistsCurrencyCreditsSpecialists = computed(() => GameHelper.isSpecialistsCurrencyCreditsSpecialists(game.value));
const isDataCleaned = computed(() => game.value.state.cleaned);
const isTutorialGame = computed(() => GameHelper.isTutorialGame(game.value));
const canEndTurn = computed(() => !gameIsFinished.value);

const isLoggedIn = computed(() => store.state.userId != null);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const gameIsPaused = computed(() => GameHelper.isGamePaused(game.value));

const timeRemaining = ref<string | null>(null);
const unreadMessages = ref<number | null>(null);
const unreadEvents = ref<number | null>(null);
const intervalFunction = ref<number | null>(null);

const fitGalaxy = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandFitGalaxy, {});
};

const zoomIn = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomIn, {});
};

const zoomOut = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomOut, {});
};

const goToMyGames = () => {
  router.push({ name: 'game-active-games' });
};

const goToMainMenu = () => {
  router.push({ name: 'main-menu' });
};

const reloadPage = () => location.reload();

const panToHomeStar = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToUser, {});

  if (userPlayer.value) {
    emit('onOpenPlayerDetailRequested', userPlayer.value._id);
  }
};

const setMenuState = (state, args) => {
  store.commit('setMenuState', {
    state,
    args
  });
};

const onViewResearchRequested = () => {
  setMenuState(MENU_STATES.RESEARCH, null);
};

const onViewBulkUpgradeRequested = () => {
  setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE, null);
};

const handleKeyDown = (e: KeyboardEvent): void => {
  if (/^(?:input|textarea|select|button)$/i.test((e.target as HTMLElement).tagName)) {
    return;
  }

  const key = e.key;

  // Check for modifier keys and ignore the keypress if there is one.
  if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
    return;
  }

  const isLoggedIn = store.state.userId != null;
  const isInGame = userPlayer.value != null;

  let menuState = KEYBOARD_SHORTCUTS.all[key];

  if (menuState === null) {
    setMenuState(null, null);
    return;
  }

  if (isLoggedIn) {
    menuState = menuState || KEYBOARD_SHORTCUTS.user[key];
  }

  // Handle keyboard shortcuts for screens only available for users
  // who are players.
  if (isInGame) {
    menuState = menuState || KEYBOARD_SHORTCUTS.player[key];
  }

  if (!menuState) {
    return;
  }

  // Special case for Inbox shortcut, only do this if the screen is small.
  if (menuState === MENU_STATES.INBOX && window.innerWidth >= 992) {
    return;
  }

  let menuArguments = menuState.split('|')[1];
  menuState = menuState.split('|')[0];

  // Special case for intel, which is not accessible for dark mode extra games.
  if (menuState === MENU_STATES.INTEL && GameHelper.isDarkModeExtra(game.value) && !gameIsFinished.value) {
    return;
  }

  switch (menuState) {
    case null:
      setMenuState(null, null);
      break;
    case 'HOME_STAR':
      panToHomeStar();
      break;
    case 'FIT_GALAXY':
      fitGalaxy();
      break;
    case 'ZOOM_IN':
      eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomIn, {});
      break;
    case 'ZOOM_OUT':
      eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomOut, {});
      break;
    default:
      setMenuState(menuState, menuArguments || null);
      break;
  }
};

const recalculateTimeRemaining = () => {
  if (!game.value) {
    return;
  }

  if (gameIsPendingStart.value) {
    timeRemaining.value = GameHelper.getCountdownTimeString(game.value, game.value.state.startDate);
  } else {
    const ticksToProduction = GameHelper.getTicksToProduction(game.value, store.state.tick, store.state.productionTick);

    timeRemaining.value = GameHelper.getCountdownTimeStringByTicks(game.value, ticksToProduction);
  }
};

const onTechnologyReceived = ({ data }: { data: { fromPlayerId: string, toPlayerId: string, technology: TradeEventTechnology } }) => {
  const player = GameHelper.getUserPlayer(game.value)!;
  const fromPlayer = GameHelper.getPlayerById(game.value, data.fromPlayerId)!;

  player.research[data.technology.name].level = data.technology.level;
  player.research[data.technology.name].progress = 0;

  toast.info(`You received ${data.technology.name} level ${data.technology.level} from ${fromPlayer.alias}.`)
};

const onCreditsReceived = ({ data }: { data: { fromPlayerId: string, toPlayerId: string, credits: number }}) => {
  // TODO: This logic should be in the store like the other subscriptions.
  // However the current component could still subscribe to it to display the toast.
  const player = GameHelper.getUserPlayer(game.value)!;
  const fromPlayer = GameHelper.getPlayerById(game.value, data.fromPlayerId)!;

  player.credits += data.credits;

  toast.info(`You received $${data.credits} from ${fromPlayer.alias}.`)
};

const onCreditsSpecialistsReceived = ({ data }: { data: { fromPlayerId: string, toPlayerId: string, creditsSpecialists: number } }) => {
  const player = GameHelper.getUserPlayer(game.value)!;
  const fromPlayer = GameHelper.getPlayerById(game.value, data.fromPlayerId)!;

  player.creditsSpecialists += data.creditsSpecialists;

  toast.info(`You received ${data.creditsSpecialists} specialist token(s) from ${fromPlayer.alias}.`);
}

const setupTimer = () => {
  recalculateTimeRemaining();

  if (gameIsInProgress.value || gameIsPendingStart.value) {
    intervalFunction.value = setInterval(recalculateTimeRemaining, 250);
    recalculateTimeRemaining();
  }
};

const checkForUnreadMessages = async () => {
  if (!userPlayer.value) {
    return;
  }

  const response = await getUnreadCount(httpClient)(game.value._id);
  if (isOk(response)) {
    unreadMessages.value = response.data.unread;

    store.commit('setUnreadMessages', unreadMessages.value);
  } else {
    console.error(formatError(response));
  }
};

const checkForUnreadEvents = async () => {
  if (!userPlayer.value) {
    return;
  }

  // sadly, this must stay until the events are typed
  try {
    const response = await EventApiService.getUnreadCount(game.value._id);

    if (response.status === 200) {
      unreadEvents.value = response.data.unread;
    }
  } catch (err) {
    console.error(err);
  }
};

const gameStarted = () => {
  setupTimer();
};

watch(game, () => {
  if (!isHistoricalMode.value) {
    checkForUnreadEvents();
  }
});

onMounted(async () => {
  document.addEventListener('keydown', handleKeyDown);

  setupTimer();

  eventBus.on(GameEventBusEventNames.GameStarted, gameStarted);
  eventBus.on(UserEventBusEventNames.GameMessageSent, checkForUnreadMessages);
  eventBus.on(PlayerEventBusEventNames.GameConversationRead, checkForUnreadMessages);
  eventBus.on(PlayerEventBusEventNames.PlayerEventRead, checkForUnreadEvents);
  eventBus.on(PlayerEventBusEventNames.PlayerAllEventsRead, checkForUnreadEvents);
  eventBus.on(PlayerEventBusEventNames.PlayerCreditsReceived, onCreditsReceived);
  eventBus.on(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, onCreditsSpecialistsReceived);
  eventBus.on(PlayerEventBusEventNames.PlayerTechnologyReceived, onTechnologyReceived);

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);

    eventBus.off(GameEventBusEventNames.GameStarted, gameStarted);
    eventBus.off(UserEventBusEventNames.GameMessageSent, checkForUnreadMessages);
    eventBus.off(PlayerEventBusEventNames.GameConversationRead, checkForUnreadMessages);
    eventBus.off(PlayerEventBusEventNames.PlayerEventRead, checkForUnreadEvents);
    eventBus.off(PlayerEventBusEventNames.PlayerAllEventsRead, checkForUnreadEvents);
    eventBus.off(PlayerEventBusEventNames.PlayerCreditsReceived, onCreditsReceived);
    eventBus.off(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, onCreditsSpecialistsReceived);
    eventBus.off(PlayerEventBusEventNames.PlayerTechnologyReceived, onTechnologyReceived);

    intervalFunction.value && clearInterval(intervalFunction.value);
  });

  await checkForUnreadMessages();
  await checkForUnreadEvents();
});
</script>

<style scoped>
.pointer {
  cursor:pointer;
}

.pulse {
  animation: blinker 1.5s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0.3;
  }
}
</style>
