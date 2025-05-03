<template>
<div class="container-fluid header-bar" :class="{'header-bar-bg':!$isHistoricalMode(),'bg-dark':$isHistoricalMode()}">
    <div class="row pt-2 pb-2 g-0">
        <div class="col-auto d-none d-md-inline-block me-5 pointer pt-1" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)">
            <server-connection-status/>

            {{game.settings.general.name}}
        </div>
        <div class="col-auto pt-1 me-3">
            <span class="pointer" v-if="gameIsPaused" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)">{{getGameStatusText}}</span>
            <span class="pointer" v-if="gameIsInProgress" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Next production tick"><i class="fas fa-clock"></i> {{timeRemaining}}</span>
            <span class="pointer" v-if="gameIsPendingStart" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Game starts in"><i class="fas fa-stopwatch"></i> {{timeRemaining}}</span>
        </div>
        <div class="col-auto pt-1" v-if="isLoggedIn && isTimeMachineEnabled && !isDataCleaned && !gameIsWaitingForPlayers">
          <tick-selector />
        </div>
        <div class="col text-end pt-1">
            <span v-if="userPlayer" class="pointer me-2" title="Total credits" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)">
                <i class="fas fa-dollar-sign text-success"></i> {{userPlayer.credits}}
            </span>

            <span class="pointer me-2" v-if="userPlayer && isSpecialistsCurrencyCreditsSpecialists" title="Total specialist tokens" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)">
                <i class="fas fa-coins text-success"></i> {{userPlayer.creditsSpecialists}}
            </span>

            <research-progress class="d-none d-lg-inline-block me-2" v-if="userPlayer" @onViewResearchRequested="onViewResearchRequested"/>
        </div>
        <div class="col-auto text-end pointer pt-1" v-if="userPlayer" @click="onViewBulkUpgradeRequested">
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
            <button class="btn btn-sm btn-warning" v-if="isTutorialGame" @click="setMenuState(MENU_STATES.TUTORIAL)">
              <i class="fas fa-user-graduate"></i>
              <span class="d-none d-md-inline-block ms-1">Tutorial</span>
            </button>

            <button class="btn btn-sm btn-success ms-1" v-if="!userPlayer && gameIsJoinable" @click="setMenuState(MENU_STATES.WELCOME)">Join Now</button>

            <ready-status-button :smallButtons="true" v-if="!$isHistoricalMode() && userPlayer && isTurnBasedGame && canEndTurn && !userPlayer.defeated" class="ms-1" />

            <button class="btn btn-sm ms-1 d-lg-none" v-if="userPlayer && !isTutorialGame" :class="{'btn-outline-info': !unreadMessages, 'btn-warning': unreadMessages}" v-on:click="setMenuState(MENU_STATES.INBOX)" title="Inbox (M)">
                <i class="fas fa-comments"></i> <span class="ms-1" v-if="unreadMessages">{{unreadMessages}}</span>
            </button>

            <button class="btn btn-sm ms-1" v-if="userPlayer" :class="{'btn-outline-info': !unreadEvents, 'btn-warning': unreadEvents}" v-on:click="setMenuState(MENU_STATES.EVENT_LOG)" title="Event Log (E)">
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

<script>
import GameHelper from '../../../../services/gameHelper'
import router from '../../../../router'
import MENU_STATES from '../../../../services/data/menuStates'
import KEYBOARD_SHORTCUTS from '../../../../services/data/keyboardShortcuts'
import ServerConnectionStatusVue from './ServerConnectionStatus.vue'
import ResearchProgressVue from './ResearchProgress.vue'
import ConversationApiService from '../../../../services/api/conversation'
import EventApiService from '../../../../services/api/event'
import HamburgerMenuVue from './HamburgerMenu.vue'
import TickSelectorVue from './TickSelector.vue'
import ReadyStatusButtonVue from './ReadyStatusButton.vue'
import gameHelper from "../../../../services/gameHelper";
import { eventBusInjectionKey } from '../../../../eventBus'
import { inject } from 'vue'
import GameEventBusEventNames from '../../../../eventBusEventNames/game'
import PlayerEventBusEventNames from '../../../../eventBusEventNames/player'
import UserEventBusEventNames from "../../../../eventBusEventNames/user";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'server-connection-status': ServerConnectionStatusVue,
    'research-progress': ResearchProgressVue,
    'hamburger-menu': HamburgerMenuVue,
    'tick-selector': TickSelectorVue,
    'ready-status-button': ReadyStatusButtonVue
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      audio: null,
      forceRecomputeCounter: 0, // Need to use this hack to force vue to recalculate the time remaining
      MENU_STATES: MENU_STATES,
      timeRemaining: null,
      intervalFunction: null,
      unreadMessages: 0,
      unreadEvents: 0
    }
  },
  created () {
    document.addEventListener('keydown', this.handleKeyDown);
  },
  async mounted () {
    this.setupTimer()

    await this.checkForUnreadMessages()
    await this.checkForUnreadEvents()

    this.eventBus.on(GameEventBusEventNames.GameStarted, this.gameStarted);
    this.eventBus.on(UserEventBusEventNames.GameMessageSent, this.checkForUnreadMessages);
    this.eventBus.on(PlayerEventBusEventNames.GameConversationRead, this.checkForUnreadMessages);
    this.eventBus.on(PlayerEventBusEventNames.PlayerEventRead, this.checkForUnreadEvents);
    this.eventBus.on(PlayerEventBusEventNames.PlayerAllEventsRead, this.checkForUnreadEvents);
    this.eventBus.on(PlayerEventBusEventNames.PlayerCreditsReceived, this.onCreditsReceived);
    this.eventBus.on(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, this.onCreditsSpecialistsReceived);
    this.eventBus.on(PlayerEventBusEventNames.PlayerTechnologyReceived, this.onTechnologyReceived);
  },
  unmounted () {
    document.removeEventListener('keydown', this.handleKeyDown)

    clearInterval(this.intervalFunction)

    this.eventBus.off(GameEventBusEventNames.GameStarted, this.gameStarted);
    this.eventBus.off(UserEventBusEventNames.GameMessageSent, this.checkForUnreadMessages);
    this.eventBus.off(PlayerEventBusEventNames.GameConversationRead, this.checkForUnreadMessages);
    this.eventBus.off(PlayerEventBusEventNames.PlayerEventRead, this.checkForUnreadEvents);
    this.eventBus.off(PlayerEventBusEventNames.PlayerAllEventsRead, this.checkForUnreadEvents);
    this.eventBus.off(PlayerEventBusEventNames.PlayerCreditsReceived, this.onCreditsReceived);
    this.eventBus.off(PlayerEventBusEventNames.PlayerCreditsSpecialistsReceived, this.onCreditsSpecialistsReceived);
    this.eventBus.off(PlayerEventBusEventNames.PlayerTechnologyReceived, this.onTechnologyReceived);
  },
  methods: {
    gameStarted () {
      this.setupTimer()
    },
    setupTimer () {
      this.recalculateTimeRemaining()

      if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
        this.intervalFunction = setInterval(this.recalculateTimeRemaining, 250)
        this.recalculateTimeRemaining()
      }
    },
    setMenuState (state, args) {
      this.$store.commit('setMenuState', {
        state,
        args
      })
    },
    onCreditsReceived (data) {
      // TODO: This logic should be in the store like the other subscriptions.
      // However the current component could still subscribe to it to display the toast.
      let player = GameHelper.getUserPlayer(this.$store.state.game)
      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, data.data.fromPlayerId)

      player.credits += data.data.credits

      this.$toast.info(`You received $${data.data.credits} from ${fromPlayer.alias}.`)
    },
    onCreditsSpecialistsReceived (data) {
      let player = GameHelper.getUserPlayer(this.$store.state.game)
      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, data.data.fromPlayerId)

      player.creditsSpecialists += data.data.creditsSpecialists

      this.$toast.info(`You received ${data.data.creditsSpecialists} specialist token(s) from ${fromPlayer.alias}.`)
    },
    onTechnologyReceived (data) {
      let player = GameHelper.getUserPlayer(this.$store.state.game)
      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, data.data.fromPlayerId)

      player.research[data.data.technology.name].level = data.data.technology.level
      player.research[data.data.technology.name].progress = 0

      this.$toast.info(`You received ${data.data.technology.name} level ${data.data.technology.level} from ${fromPlayer.alias}.`)
    },
    goToMainMenu () {
      router.push({ name: 'main-menu' })
    },
    goToMyGames () {
      router.push({ name: 'game-active-games' })
    },
    onViewResearchRequested (e) {
      this.setMenuState(this.MENU_STATES.RESEARCH)
    },
    onViewBulkUpgradeRequested (e) {
      this.setMenuState(this.MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)
    },
    fitGalaxy () {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandFitGalaxy, {});
    },
    zoomIn () {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomIn, {});
    },
    zoomOut () {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomOut, {});
    },
    panToHomeStar () {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToUser, {});

      if (this.userPlayer) {
        this.$emit('onOpenPlayerDetailRequested', this.userPlayer._id)
      }
    },
    recalculateTimeRemaining () {
      if (!this.$store.state.game) {
        return
      }

      if (GameHelper.isGamePendingStart(this.$store.state.game)) {
        this.timeRemaining = GameHelper.getCountdownTimeString(this.$store.state.game, this.$store.state.game.state.startDate)
      } else {
        const ticksToProduction = GameHelper.getTicksToProduction(this.$store.state.game, this.$store.state.tick, this.$store.state.productionTick)

        this.timeRemaining = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, ticksToProduction)
      }
    },
    async checkForUnreadMessages () {
      if (!this.userPlayer) {
        return
      }

      try {
        let response = await ConversationApiService.getUnreadCount(this.$store.state.game._id)

        if (response.status === 200) {
          this.unreadMessages = response.data.unread

          this.$store.commit('setUnreadMessages', response.data.unread)
        }
      } catch (err) {
        console.error(err)
      }
    },
    async checkForUnreadEvents () {
      if (!this.userPlayer) {
        return
      }

      try {
        let response = await EventApiService.getUnreadCount(this.$store.state.game._id)

        if (response.status === 200) {
          this.unreadEvents = response.data.unread
        }
      } catch (err) {
        console.error(err)
      }
    },
    handleKeyDown (e) {
      if (/^(?:input|textarea|select|button)$/i.test(e.target.tagName)) return

      let key = e.key

      // Check for modifier keys and ignore the keypress if there is one.
      if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
        return
      }

      let isLoggedIn = this.$store.state.userId != null
      let isInGame = this.userPlayer != null

      let menuState = KEYBOARD_SHORTCUTS.all[key]

      if (menuState === null) {
        return this.setMenuState(null, null)
      }

      if (isLoggedIn) {
        menuState = menuState || KEYBOARD_SHORTCUTS.user[key]
      }

      // Handle keyboard shortcuts for screens only available for users
      // who are players.
      if (isInGame) {
        menuState = menuState || KEYBOARD_SHORTCUTS.player[key]
      }

      if (!menuState) {
        return
      }

      // Special case for Inbox shortcut, only do this if the screen is small.
      if (menuState === MENU_STATES.INBOX && window.innerWidth >= 992) {
        return
      }

      let menuArguments = menuState.split('|')[1]
      menuState = menuState.split('|')[0]

      // Special case for intel, which is not accessible for dark mode extra games.
      if (menuState === MENU_STATES.INTEL && GameHelper.isDarkModeExtra(this.$store.state.game)) {
        return
      }

      switch (menuState) {
        case null:
          this.setMenuState(null, null)
          break
        case 'HOME_STAR':
          this.panToHomeStar()
          break
        case 'FIT_GALAXY':
          this.fitGalaxy()
          break
        case 'ZOOM_IN':
          this.eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomIn, {});
          break
        case 'ZOOM_OUT':
          this.eventBus.emit(MapCommandEventBusEventNames.MapCommandZoomOut, {});
          break
        default:
          this.setMenuState(menuState, menuArguments || null)
          break
      }
    },
    reloadPage () {
      location.reload()
    }
  },
  computed: {
    game () {
      return this.$store.state.game
    },
    isLoggedIn () {
      return this.$store.state.userId != null
    },
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    gameIsPaused () {
      return GameHelper.isGamePaused(this.$store.state.game)
    },
    gameIsInProgress () {
      return GameHelper.isGameInProgress(this.$store.state.game)
    },
    gameIsPendingStart () {
      return GameHelper.isGamePendingStart(this.$store.state.game)
    },
    gameIsFinished () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    gameIsJoinable () {
      return !this.gameIsInProgress && !this.gameIsFinished
    },
    gameIsWaitingForPlayers () {
      return GameHelper.isGameWaitingForPlayers(this.$store.state.game)
    },
    getGameStatusText (game) {
      return GameHelper.getGameStatusText(this.$store.state.game)
    },
    isTurnBasedGame () {
      return this.$store.state.game.settings.gameTime.gameType === 'turnBased'
    },
    isTimeMachineEnabled () {
      return this.$store.state.game.settings.general.timeMachine === 'enabled'
    },
    isSpecialistsCurrencyCreditsSpecialists () {
      return GameHelper.isSpecialistsCurrencyCreditsSpecialists(this.$store.state.game)
    },
    isDataCleaned () {
      return this.$store.state.game.state.cleaned
    },
    isTutorialGame () {
      return GameHelper.isTutorialGame(this.$store.state.game)
    },
    canEndTurn () {
      return !GameHelper.isGameFinished(this.$store.state.game)
    }
  },
  watch: {
    game (newGame, oldGame) {
      if (!this.$isHistoricalMode()) {
        this.checkForUnreadEvents()
      }
    }
  }
}
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
