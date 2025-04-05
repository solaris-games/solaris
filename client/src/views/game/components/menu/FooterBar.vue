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

<script>
import GameHelper from '../../../../services/gameHelper'
import MENU_STATES from '../../../../services/data/menuStates'
import HamburgerMenuVue from './HamburgerMenu.vue'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'hamburger-menu': HamburgerMenuVue
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      MENU_STATES: MENU_STATES
    }
  },
  methods: {
    setMenuState (state, args) {
      this.$store.commit('setMenuState', {
        state,
        args
      })
    },
    panToHomeStar () {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToUser, {});

      if (this.userPlayer) {
        this.$emit('onOpenPlayerDetailRequested', this.userPlayer._id)
      }
    }
  },
  computed: {
    game () {
      return this.$store.state.game
    },
    gameIsInProgress () {
      return GameHelper.isGameInProgress(this.$store.state.game)
    },
    gameIsFinished () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
    gameIsJoinable () {
      return !this.gameIsInProgress && !this.gameIsFinished
    },
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    isLoggedIn () {
      return this.$store.state.userId != null
    },
    isDarkModeExtra () {
      return GameHelper.isDarkModeExtra(this.$store.state.game)
    },
    isDataCleaned () {
      return this.$store.state.game.state.cleaned
    }
  }
}
</script>

<style scoped>
.pointer {
  cursor:pointer;
}

.col {
  text-align: center;
}
</style>
