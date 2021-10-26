<template>
<div class="container-fluid header-bar" :class="{'bg-dark':!$isHistoricalMode(),'bg-primary':$isHistoricalMode()}">
    <div class="row pt-2 pb-2 no-gutters">
        <div class="col-auto d-none d-md-block mr-5 pointer pt-1" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)">
            <server-connection-status/>

            {{game.settings.general.name}}
        </div>
        <div class="col pt-1">
            <span class="pointer" v-if="gameIsPaused" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)">{{getGameStatusText}}</span>
            <span class="pointer" v-if="gameIsInProgress" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Next Production Tick"><i class="fas fa-clock"></i> {{timeRemaining}}</span>
            <span class="pointer" v-if="gameIsPendingStart" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Game Starts In"><i class="fas fa-stopwatch"></i> {{timeRemaining}}</span>
        </div>
        <div class="col-auto pt-1 mr-4" v-if="isLoggedIn && isTimeMachineEnabled && !isDataCleaned">
          <tick-selector />
        </div>
        <div class="col-auto d-none d-md-block text-right pt-1" v-if="userPlayer">
            <span class="pointer" title="Credits" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)">
                <i class="fas fa-dollar-sign mr-1"></i>{{userPlayer.credits}}
            </span>

            <span class="pointer" v-if="isSpecialistsCurrencyCreditsSpecialists" title="Specialist Tokens" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)">
                <i class="fas fa-coins mr-1"></i>{{userPlayer.creditsSpecialists}}
            </span>

            <research-progress class="d-none d-lg-inline-block ml-1" @onViewResearchRequested="onViewResearchRequested"/>
        </div>
        <div class="col-auto text-right pointer pt-1" v-if="userPlayer" @click="onViewBulkUpgradeRequested">
            <span class="d-none d-lg-inline-block ml-3">
                <i class="fas fa-money-bill-wave text-success mr-1"></i>{{userPlayer.stats.totalEconomy}}
            </span>
            <span class="d-none d-lg-inline-block ml-2">
                <i class="fas fa-tools text-warning mr-1"></i>{{userPlayer.stats.totalIndustry}}
            </span>
            <span class="d-none d-lg-inline-block ml-2">
                <i class="fas fa-flask text-info mr-1"></i>{{userPlayer.stats.totalScience}}
            </span>
        </div>
        <div class="col-auto ml-1">
            <button class="btn btn-sm btn-success" v-if="!userPlayer && gameIsJoinable" @click="setMenuState(MENU_STATES.WELCOME)">Join Now</button>

            <!-- Ready button -->
            <button class="btn btn-sm ml-1" v-if="userPlayer && isTurnBasedGame && !gameIsFinished && !userPlayer.defeated" :class="{'btn-success pulse': !userPlayer.ready, 'btn-danger': userPlayer.ready}" v-on:click="toggleReadyStatus()">
                <i class="fas fa-times" v-if="userPlayer.ready"></i>
                <i class="fas fa-check" v-if="!userPlayer.ready"></i>
            </button>

            <button class="btn btn-sm ml-1 d-lg-none" v-if="userPlayer" :class="{'btn-info': !unreadMessages, 'btn-warning': unreadMessages}" v-on:click="setMenuState(MENU_STATES.INBOX)" title="Inbox (M)">
                <i class="fas fa-comments"></i> <span class="ml-1" v-if="unreadMessages">{{unreadMessages}}</span>
            </button>

            <button class="btn btn-sm ml-1" v-if="userPlayer" :class="{'btn-info': !unreadEvents, 'btn-warning': unreadEvents}" v-on:click="setMenuState(MENU_STATES.EVENT_LOG)" title="Event Log (E)">
                <i class="fas fa-inbox"></i> <span class="ml-1" v-if="unreadEvents">{{unreadEvents}}</span>
            </button>

            <hamburger-menu class="ml-1 d-none d-sm-inline-block" :buttonClass="'btn-sm btn-info'" :dropType="'dropleft'" @onMenuStateChanged="onMenuStateChanged"/>
            
            <button class="btn btn-sm btn-info ml-1 d-none d-sm-inline-block" type="button" @click="goToMyGames()">
                <i class="fas fa-chevron-left"></i>
            </button>
        </div>
    </div>
</div>
</template>

<script>
import { mapState } from 'vuex'
import { setInterval } from 'timers'
import GameHelper from '../../../services/gameHelper'
import router from '../../../router'
import MENU_STATES from '../../data/menuStates'
import KEYBOARD_SHORTCUTS from '../../data/keyboardShortcuts'
import GameContainer from '../../../game/container'
import ServerConnectionStatusVue from './ServerConnectionStatus'
import ResearchProgressVue from './ResearchProgress'
import AudioService from '../../../game/audio'
import ConversationApiService from '../../../services/api/conversation'
import EventApiService from '../../../services/api/event'
import GameApiService from '../../../services/api/game'
import HamburgerMenuVue from './HamburgerMenu'
import TickSelectorVue from './TickSelector'

export default {
  components: {
    'server-connection-status': ServerConnectionStatusVue,
    'research-progress': ResearchProgressVue,
    'hamburger-menu': HamburgerMenuVue,
    'tick-selector': TickSelectorVue
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
  async mounted () {
    this.setupTimer()

    await this.checkForUnreadMessages()
    await this.checkForUnreadEvents()
  },
  created () {
    document.addEventListener('keydown', this.handleKeyDown)

    this.sockets.subscribe('gameStarted', this.gameStarted.bind(this))
    this.sockets.subscribe('gameMessageSent', this.checkForUnreadMessages.bind(this))
    this.sockets.subscribe('gameConversationRead', this.checkForUnreadMessages.bind(this))
    this.sockets.subscribe('playerEventRead', this.checkForUnreadEvents.bind(this))
    this.sockets.subscribe('playerAllEventsRead', this.checkForUnreadEvents.bind(this))
    this.sockets.subscribe('playerCreditsReceived', this.onCreditsReceived)
    this.sockets.subscribe('playerCreditsSpecialistsReceived', this.onCreditsSpecialistsReceived)
    this.sockets.subscribe('playerTechnologyReceived', this.onTechnologyReceived)
  },
  destroyed () {
    document.removeEventListener('keydown', this.handleKeyDown)

    clearInterval(this.intervalFunction)

    this.sockets.unsubscribe('gameStarted')
    this.sockets.unsubscribe('gameMessageSent')
    this.sockets.unsubscribe('gameConversationRead')
    this.sockets.unsubscribe('playerEventRead')
    this.sockets.unsubscribe('playerAllEventsRead')
    this.sockets.unsubscribe('playerCreditsReceived')
    this.sockets.unsubscribe('playerCreditsSpecialistsReceived')
    this.sockets.unsubscribe('playerTechnologyReceived')
  },
  methods: {
    gameStarted () {
      this.setupTimer()

      this.$toasted.show(`Get ready, the game will start soon!`, { type: 'success' })
      AudioService.download()
    },
    setupTimer () {
      this.recalculateTimeRemaining()

      if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
        this.intervalFunction = setInterval(this.recalculateTimeRemaining, 1000)
        this.recalculateTimeRemaining()
      }
    },
    setMenuState (state, args) {
      this.$emit('onMenuStateChanged', {
        state,
        args
      })
    },
    onMenuStateChanged (e) {
      this.$emit('onMenuStateChanged', e)
    },
    onCreditsReceived (data) {
      // TODO: This logic should be in the store like the other subscriptions.
      // However the current component could still subscribe to it to display the toast.
      let player = GameHelper.getUserPlayer(this.$store.state.game)
      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, data.data.fromPlayerId)

      player.credits += data.data.credits

      this.$toasted.show(`You received $${data.data.credits} from ${fromPlayer.alias}.`, { type: 'info' })
    },
    onCreditsSpecialistsReceived (data) {
      let player = GameHelper.getUserPlayer(this.$store.state.game)
      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, data.data.fromPlayerId)

      player.creditsSpecialists += data.data.creditsSpecialists

      this.$toasted.show(`You received ${data.data.creditsSpecialists} specialist token(s) from ${fromPlayer.alias}.`, { type: 'info' })
    },
    onTechnologyReceived (data) {
      let fromPlayer = GameHelper.getPlayerById(this.$store.state.game, data.data.fromPlayerId)

      this.$toasted.show(`You received ${data.data.technology.name} level ${data.data.technology.level} from ${fromPlayer.alias}.`, { type: 'info' })
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
      GameContainer.viewport.moveCenter(0, 0)
      GameContainer.viewport.fitWorld()
      GameContainer.viewport.zoom(GameContainer.starFieldRight, true)
    },
    zoomIn () {
      GameContainer.zoomIn()
    },
    zoomOut () {
      GameContainer.zoomOut()
    },
    panToHomeStar () {
      GameContainer.map.panToUser(this.$store.state.game)

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
        let ticksToProduction = GameHelper.getTicksToProduction(this.$store.state.game, this.$store.state.tick, this.$store.state.productionTick)

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
    async toggleReadyStatus () {
      try {
        if (this.userPlayer.ready) {
          let response = await GameApiService.unconfirmReady(this.$store.state.game._id)

          if (response.status === 200) {
            this.userPlayer.ready = false
          }
        } else {
          if (!await this.$confirm('End turn', 'Are you sure you want to end your turn?')) {
            return
          }

          let response = await GameApiService.confirmReady(this.$store.state.game._id)

          if (response.status === 200) {
            this.$toasted.show(`You have confirmed your move, please wait for other players to ready up.`, { type: 'success' })

            this.userPlayer.ready = true
          }
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
          GameContainer.zoomIn()
          break
        case 'ZOOM_OUT':
          GameContainer.zoomOut()
          break
        default:
          this.setMenuState(menuState, menuArguments || null)
          break
      }
    },
    reloadPage () {
      window.location.reload()
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
    }
  },
  watch: {
    game (newGame, oldGame) {
      this.checkForUnreadEvents()
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
