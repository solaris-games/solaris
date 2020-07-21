<template>
<div class="bg-primary">
    <div class="container-fluid">
        <div class="row no-gutters pt-2 pb-2">
            <div class="col-auto dropdown">
                <button class="btn btn-sm btn-info" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i class="fas fa-bars"></i>
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <div class="pl-2">
                        <button class="btn btn-primary btn-sm mr-1 mb-1" @click="fitGalaxy"><i class="fas fa-compass"></i></button>
                        <button class="btn btn-primary btn-sm mr-1 mb-1" @click="zoomByPercent(0.5)"><i class="fas fa-search-plus"></i></button>
                        <button class="btn btn-primary btn-sm mr-1 mb-1" @click="zoomByPercent(-0.3)"><i class="fas fa-search-minus"></i></button>
                        <button class="btn btn-primary btn-sm mr-1 mb-1" @click="setMenuState(MENU_STATES.COMBAT_CALCULATOR)"><i class="fas fa-calculator"></i></button>
                        <div v-if="getUserPlayer()">
                          <button class="btn btn-primary btn-sm mr-1 mb-1" @click="zoomToHomeStar()"><i class="fas fa-home"></i></button>
                          <button class="btn btn-primary btn-sm mr-1 mb-1"><i class="fas fa-ruler"></i></button>
                          <button class="btn btn-primary btn-sm mr-1 mb-1"><i class="fas fa-bolt"></i></button>
                          <button class="btn btn-primary btn-sm mr-1 mb-1" v-if="!getUserPlayer().defeated" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)"><i class="fas fa-money-bill"></i></button>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div v-if="!getUserPlayer()">
                      <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.WELCOME)"><i class="fas fa-handshake mr-2"></i>Welcome</a>
                    </div>
                    <div v-if="getUserPlayer()">
                      <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)"><i class="fas fa-users mr-2"></i>Leaderboard</a>
                      <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.RESEARCH)"><i class="fas fa-flask mr-2"></i>Research</a>
                      <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.GALAXY)"><i class="fas fa-star mr-2"></i>Galaxy</a>
                      <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.INTEL)"><i class="fas fa-chart-line mr-2"></i>Intel</a>
                      <!-- <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.OPTIONS)"><i class="fas fa-cog mr-2"></i>Options</a> -->
                    </div>
                    <!-- <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.HELP)"><i class="fas fa-question mr-2"></i>Help</a> -->
                    <a class="dropdown-item" v-on:click="goToMainMenu()"><i class="fas fa-chevron-left mr-2"></i>Main Menu</a>
                </div>
            </div>
            <div class="col-auto text-center pl-3">
                <span class="align-middle" v-if="getUserPlayer()">Credits: ${{getUserPlayer().credits}}</span>
                <span class="align-middle" v-if="!getUserPlayer()">{{game.settings.general.name}}</span>
            </div>
            <div class="col text-right pr-3" v-if="getUserPlayer()">
                <span class="align-middle" v-if="!game.state.paused">Production: {{timeRemaining}}</span>
                <span class="align-middle" v-if="game.state.paused">Paused</span>
            </div>
            <div class="col-auto" v-if="getUserPlayer()">
                <button class="btn btn-sm btn-info" v-on:click="setMenuState(MENU_STATES.INBOX)">
                    <i class="fas fa-inbox"></i>
                </button>
            </div>
            <div class="col" v-if="!getUserPlayer() && !game.state.startDate">
              <button class="btn btn-success float-right" @click="setMenuState(MENU_STATES.WELCOME)">Join Now</button>
            </div>
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

export default {
  data () {
    return {
      forceRecomputeCounter: 0, // Need to use this hack to force vue to recalculate the time remaining
      MENU_STATES: MENU_STATES,
      timeRemaining: null,
      intervalFunction: null
    }
  },
  mounted () {
    this.recalculateTimeRemaining()

    if (!this.$store.state.game.state.paused) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 100)
    }
  },
  created () {
    this.sockets.listener.subscribe('playerCreditsReceived', (data) => {
      let player = GameHelper.getUserPlayer(this.$store.state.game)
      player.credits += data
    })
  },
  destroyed () {
    clearInterval(this.intervalFunction)

    this.sockets.listener.unsubscribe('playerCreditsReceived')
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
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
    fitGalaxy () {
      GameContainer.viewport.fitWorld()
      GameContainer.viewport.zoom(GameContainer.starFieldRight, true)
      GameContainer.viewport.moveCenter(0,0)
    },
    zoomByPercent (percent) {
      GameContainer.viewport.zoomPercent(percent, true)
    },
    zoomToHomeStar () {
      GameContainer.map.zoomToUser(this.$store.state.game)
    },
    recalculateTimeRemaining () {
      if (this.$store.state.game.state.paused) {
        return
      }

      let productionTicks = this.$store.state.game.settings.galaxy.productionTicks
      let currentTick = this.$store.state.game.state.tick
      let currentProductionTick = this.$store.state.game.state.productionTick
      
      let ticksToProduction = ((currentProductionTick + 1) * productionTicks) - currentTick
      let nextProductionTickDate = GameHelper.calculateTimeByTicks(ticksToProduction, 
        this.$store.state.game.settings.gameTime.speed, this.$store.state.game.state.lastTickDate)

      this.timeRemaining = GameHelper.getCountdownTimeString(this.$store.state.game, nextProductionTickDate)
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
.dropdown-menu {
  position:fixed !important;
  left: 14px !important;
  top: 8px !important;
}
</style>
