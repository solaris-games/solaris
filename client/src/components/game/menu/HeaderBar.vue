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
        <div class="col pt-1" v-if="isTimeMachineEnabled">
          <tick-selector />
        </div>
        <div class="col-auto text-right pt-1" v-if="userPlayer">
            <span class="pointer" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)">
                <i class="fas fa-dollar-sign mr-1"></i>{{userPlayer.credits}}
            </span>

            <research-progress class="d-none d-md-inline-block ml-1" @onViewResearchRequested="onViewResearchRequested"/>
        </div>
        <div class="col-auto text-right pointer pt-1" v-if="userPlayer" @click="onViewBulkUpgradeRequested">
            <span class="d-none d-md-inline-block ml-3">
                <i class="fas fa-money-bill-wave text-success mr-1"></i>{{userPlayer.stats.totalEconomy}}
            </span>
            <span class="d-none d-md-inline-block ml-2">
                <i class="fas fa-tools text-warning mr-1"></i>{{userPlayer.stats.totalIndustry}}
            </span>
            <span class="d-none d-md-inline-block ml-2">
                <i class="fas fa-flask text-info mr-1"></i>{{userPlayer.stats.totalScience}}
            </span>
        </div>
        <div class="col-auto ml-1">
            <button class="btn btn-sm btn-success" v-if="!userPlayer && gameIsJoinable" @click="setMenuState(MENU_STATES.WELCOME)">Join Now</button>

            <!-- Ready button -->
            <button class="btn btn-sm ml-1" v-if="userPlayer && isTurnBasedGame && !gameIsFinished && !userPlayer.defeated" :class="{'btn-success': !userPlayer.ready, 'btn-danger': userPlayer.ready}" v-on:click="toggleReadyStatus()">
                <i class="fas fa-times" v-if="userPlayer.ready"></i>
                <i class="fas fa-check" v-if="!userPlayer.ready"></i>
            </button>

            <button class="btn btn-sm ml-1" v-if="userPlayer" :class="{'btn-info': this.unreadMessages === 0, 'btn-warning': this.unreadMessages > 0}" v-on:click="setMenuState(MENU_STATES.INBOX)" title="Inbox (I)">
                <i class="fas fa-inbox"></i> <span class="ml-1" v-if="unreadMessages">{{this.unreadMessages}}</span>
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
import GameHelper from '../../../services/gameHelper'
import router from '../../../router'
import { setInterval } from 'timers'
import MENU_STATES from '../../data/menuStates'
import GameContainer from '../../../game/container'
import ServerConnectionStatusVue from './ServerConnectionStatus'
import ResearchProgressVue from './ResearchProgress'
import AudioService from '../../../game/audio'
import ConversationApiService from '../../../services/api/conversation'
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
      unreadMessages: 0
    }
  },
  mounted () {
    this.setupTimer()

    this.checkForUnreadMessages()
  },
  created () {
    document.addEventListener('keydown', this.handleKeyDown)

    this.sockets.subscribe('gameStarted', this.gameStarted.bind(this))
    this.sockets.subscribe('gameMessageSent', this.checkForUnreadMessages.bind(this))
    this.sockets.subscribe('gameConversationRead', this.checkForUnreadMessages.bind(this))

    this.sockets.subscribe('playerCreditsReceived', this.onCreditsReceived)
    this.sockets.subscribe('playerTechnologyReceived', this.onTechnologyReceived)
  },
  destroyed () {
    document.removeEventListener('keydown', this.handleKeyDown)

    clearInterval(this.intervalFunction)

    this.sockets.unsubscribe('gameStarted')
    this.sockets.unsubscribe('playerCreditsReceived')
    this.sockets.unsubscribe('gameConversationRead')
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
        this.intervalFunction = setInterval(this.recalculateTimeRemaining, 100)
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

      let keyCode = e.keyCode || e.which

      // Check for modifier keys and ignore the keypress if there is one.
      if (e.altKey || e.shiftKey || e.ctrlKey) {
        return
      }

      let isInGame = this.userPlayer != null

      // Handle keyboard shortcuts for screens only available for users
      // who are players.
      if (isInGame) {
        switch (keyCode) {
          case 82: // R
            this.setMenuState(MENU_STATES.RESEARCH)
            break
          case 83: // S
            this.setMenuState(MENU_STATES.GALAXY) // TODO: Open star tab
            break
          case 70: // F
            this.setMenuState(MENU_STATES.GALAXY) // TODO: Open carrier tab
            break
          case 73: // I
            this.setMenuState(MENU_STATES.INBOX)
            break
          case 86: // V
            this.setMenuState(MENU_STATES.RULER)
            break
          case 78: // N
            this.setMenuState(MENU_STATES.GAME_NOTES)
            break
          case 75: // K
            this.setMenuState(MENU_STATES.LEDGER)
            break
          case 66: // B
            this.setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)
            break
          case 72: // H
            this.panToHomeStar()
            break
        }
      }

      // Handle keyboard shortcuts for any user type.
      switch (keyCode) {
        case 27: // Esc
          this.setMenuState(null, null)
          break
        case 187: // +
          GameContainer.zoomIn()
          break
        case 189: // -
          GameContainer.zoomOut()
          break
        case 48: // -
          this.fitGalaxy()
          break
        case 76: // L
          this.setMenuState(MENU_STATES.LEADERBOARD)
          break
        case 67: // C
          this.setMenuState(MENU_STATES.COMBAT_CALCULATOR)
          break
        case 71: // G
          this.setMenuState(MENU_STATES.INTEL)
          break
        case 79: // O
          this.setMenuState(MENU_STATES.OPTIONS)
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
    }
  }
}
</script>

<style scoped>
.pointer {
  cursor:pointer;
}
</style>
