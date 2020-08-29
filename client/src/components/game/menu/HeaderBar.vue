<template>
<div class="container-fluid bg-primary header-bar">
    <div class="row pt-2 pb-2 no-gutters">
        <div class="col-auto d-none d-md-block mr-5">
            <server-connection-status/>

            {{game.settings.general.name}}
        </div>
        <div class="col">
            <span v-if="gameIsPaused()">Paused</span>
            <span v-if="gameIsInProgress()">Production: {{timeRemaining}}</span>
            <span v-if="gameIsPendingStart()">Starts In: {{timeRemaining}}</span>
        </div>
        <div class="col-auto text-right" v-if="userPlayer">
            <span>
                <i class="fas fa-dollar-sign"></i> {{userPlayer.credits}}
            </span>

            <research-progress class="d-none d-sm-inline-block ml-2" @onViewResearchRequested="onViewResearchRequested"/>
        </div>
        <div class="col-auto text-right infrastructure" v-if="userPlayer" @click="onViewBulkUpgradeRequested">
            <span class="d-none d-sm-inline-block ml-4">
                <i class="fas fa-money-bill-wave text-success"></i> {{userPlayer.stats.totalEconomy}}
            </span>
            <span class="d-none d-sm-inline-block ml-2">
                <i class="fas fa-tools text-warning"></i> {{userPlayer.stats.totalIndustry}}
            </span>
            <span class="d-none d-sm-inline-block ml-2">
                <i class="fas fa-flask text-info"></i> {{userPlayer.stats.totalScience}}
            </span>
        </div>
        <div class="col-auto dropleft ml-1">
            <button class="btn btn-sm btn-success" v-if="!userPlayer && !game.state.startDate" @click="setMenuState(MENU_STATES.WELCOME)">Join Now</button>

            <button class="btn btn-sm btn-info ml-1" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <i class="fas fa-bars"></i>
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <div class="pl-2">
                    <button class="btn btn-primary btn-sm mr-1 mb-1" @click="fitGalaxy"><i class="fas fa-compass"></i></button>
                    <button class="btn btn-primary btn-sm mr-1 mb-1" @click="zoomByPercent(0.5)"><i class="fas fa-search-plus"></i></button>
                    <button class="btn btn-primary btn-sm mr-1 mb-1" @click="zoomByPercent(-0.3)"><i class="fas fa-search-minus"></i></button>
                    <button class="btn btn-primary btn-sm mr-1 mb-1" @click="setMenuState(MENU_STATES.COMBAT_CALCULATOR)"><i class="fas fa-calculator"></i></button>
                    <div v-if="userPlayer">
                        <button class="btn btn-primary btn-sm mr-1 mb-1" @click="panToHomeStar()"><i class="fas fa-home"></i></button>
                        <button class="btn btn-primary btn-sm mr-1 mb-1" @click="setMenuState(MENU_STATES.RULER)"><i class="fas fa-ruler"></i></button>
                        <button class="btn btn-primary btn-sm mr-1 mb-1"><i class="fas fa-bolt"></i></button>
                        <button class="btn btn-primary btn-sm mr-1 mb-1" v-if="!userPlayer.defeated" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)"><i class="fas fa-money-bill"></i></button>
                    </div>
                </div>
                <div class="dropdown-divider"></div>
                <div v-if="!userPlayer">
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.WELCOME)"><i class="fas fa-handshake mr-2"></i>Welcome</a>
                </div>
                <div v-if="userPlayer">
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)"><i class="fas fa-users mr-2"></i>Leaderboard</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.RESEARCH)"><i class="fas fa-flask mr-2"></i>Research</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.GALAXY)"><i class="fas fa-star mr-2"></i>Galaxy</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.LEDGER)"><i class="fas fa-file-invoice-dollar mr-2"></i>Ledger</a>
                    <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.INTEL)"><i class="fas fa-chart-line mr-2"></i>Intel</a>
                    <!-- <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.OPTIONS)"><i class="fas fa-cog mr-2"></i>Options</a> -->
                </div>
                <!-- <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.HELP)"><i class="fas fa-question mr-2"></i>Help</a> -->
                <a class="dropdown-item" v-on:click="goToMainMenu()"><i class="fas fa-chevron-left mr-2"></i>Main Menu</a>
            </div>

            <!-- <button class="btn btn-sm btn-info ml-1" type="button">
                <i class="fas fa-sync-alt"></i>
            </button>

            <button class="btn btn-sm btn-info ml-1" type="button">
                <i class="fas fa-cog"></i>
            </button> -->
            <button class="btn btn-sm ml-1" :class="{'btn-info': this.unreadMessages === 0, 'btn-warning': this.unreadMessages > 0}" v-if="userPlayer" v-on:click="setMenuState(MENU_STATES.INBOX)">
                <i class="fas fa-inbox"></i> <span class="ml-1" v-if="unreadMessages">{{this.unreadMessages}}</span>
            </button>

            <button class="btn btn-sm btn-info ml-1" type="button" @click="goToMyGames()">
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
import * as moment from 'moment'
import AudioService from '../../../game/audio'
import MessageApiService from '../../../services/api/message'

export default {
  components: {
    'server-connection-status': ServerConnectionStatusVue,
    'research-progress': ResearchProgressVue
  },
  data () {
    return {
      forceRecomputeCounter: 0, // Need to use this hack to force vue to recalculate the time remaining
      MENU_STATES: MENU_STATES,
      timeRemaining: null,
      intervalFunction: null,
      userPlayer: null,
      unreadMessages: 0
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

    this.setupTimer()

    this.checkForUnreadMessages()
  },
  created () {
    this.sockets.subscribe('gameStarted', this.gameStarted.bind(this))
    this.sockets.subscribe('gameMessageSent', this.checkForUnreadMessages.bind(this))
    this.sockets.subscribe('gameMessagesAllRead', this.checkForUnreadMessages.bind(this))
    this.sockets.subscribe('gameMessagesRead', this.checkForUnreadMessages.bind(this))

    this.sockets.subscribe('playerCreditsReceived', (data) => {
      let player = GameHelper.getUserPlayer(this.$store.state.game)
      player.credits += data
    })
  },
  destroyed () {
    clearInterval(this.intervalFunction)

    this.sockets.unsubscribe('gameStarted')
    this.sockets.unsubscribe('playerCreditsReceived')
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
    goToMainMenu () {
      router.push({ name: 'main-menu' })
    },
    goToMyGames () {
      router.push({ name: 'game-active-games' })
    },
    onViewResearchRequested (e) {
      this.setMenuState(this.MENU_STATES.RESEARCH, e)
    },
    onViewBulkUpgradeRequested (e) {
      this.setMenuState(this.MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE, e)
    },
    fitGalaxy () {
      GameContainer.viewport.fitWorld()
      GameContainer.viewport.zoom(GameContainer.starFieldRight, true)
      GameContainer.viewport.moveCenter(0, 0)
    },
    zoomByPercent (percent) {
      GameContainer.viewport.zoomPercent(percent, true)
    },
    panToHomeStar () {
      GameContainer.map.panToUser(this.$store.state.game)
    },
    recalculateTimeRemaining () {
      if (GameHelper.isGamePendingStart(this.$store.state.game)) {
        this.timeRemaining = GameHelper.getCountdownTimeString(this.$store.state.game, this.$store.state.game.state.startDate)
      } else {
        let productionTicks = this.$store.state.game.settings.galaxy.productionTicks
        let currentTick = this.$store.state.game.state.tick
        let currentProductionTick = this.$store.state.game.state.productionTick

        let ticksToProduction = ((currentProductionTick + 1) * productionTicks) - currentTick
        let nextProductionTickDate = GameHelper.calculateTimeByTicks(ticksToProduction,
          this.$store.state.game.settings.gameTime.speed, this.$store.state.game.state.lastTickDate)

        this.timeRemaining = GameHelper.getCountdownTimeString(this.$store.state.game, nextProductionTickDate)
      }
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
    getGameStatusText (game) {
      return GameHelper.getGameStatusText(this.$store.state.game)
    },
    async checkForUnreadMessages () {
      let userPlayer = GameHelper.getUserPlayer(this.$store.state.game)

      if (!userPlayer) {
        return
      }

      try {
        let response = await MessageApiService.getUnreadCount(this.$store.state.game._id)

        if (response.status === 200) {
          this.unreadMessages = response.data.unread
        }
      } catch (err) {
        console.error(err)
      }
    }
  },
  computed: {
    game () {
      return this.$store.state.game
    }
  }
}
</script>

<style scoped>
/* .header-bar {
  position:absolute;
    overflow: auto;
    overflow-x: hidden;
} */
.infrastructure {
  cursor:pointer;
}
</style>
