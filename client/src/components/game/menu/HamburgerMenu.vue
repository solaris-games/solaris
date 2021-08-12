<template>
    <div class="dropdown-container" :class="dropType || 'dropleft'">
        <button class="btn" :class="buttonClass" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <i class="fas fa-bars"></i>
        </button>
        <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuButton">
            <div class="pl-2">
                <button class="btn btn-primary btn-sm mr-1 mb-1" @click="fitGalaxy" title="Fit Galaxy (Z)"><i class="fas fa-compass"></i></button>
                <button class="btn btn-primary btn-sm mr-1 mb-1" @click="zoomIn()" title="Zoom In (+)"><i class="fas fa-search-plus"></i></button>
                <button class="btn btn-primary btn-sm mr-1 mb-1" @click="zoomOut()" title="Zoom Out (-)"><i class="fas fa-search-minus"></i></button>
                <button v-if="userPlayer" class="btn btn-primary btn-sm mr-1 mb-1" @click="panToHomeStar()" title="Home (H)"><i class="fas fa-home"></i></button>
                <div>
                    <button v-if="isLoggedIn" class="btn btn-primary btn-sm mr-1 mb-1" @click="setMenuState(MENU_STATES.COMBAT_CALCULATOR)" title="Calculator (C)"><i class="fas fa-calculator"></i></button>
                    <button v-if="userPlayer" class="btn btn-primary btn-sm mr-1 mb-1" @click="setMenuState(MENU_STATES.RULER)" title="Ruler (V)"><i class="fas fa-ruler"></i></button>
                    <button v-if="userPlayer && !userPlayer.defeated" class="btn btn-primary btn-sm mr-1 mb-1" @click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)" title="Bulk Upgrade (B)"><i class="fas fa-money-bill"></i></button>
                    <button class="btn btn-primary btn-sm mr-1 mb-1" @click="reloadPage" title="Reload Game"><i class="fas fa-sync"></i></button>
                </div>
            </div>
            <div class="dropdown-divider"></div>
            <div v-if="!userPlayer && gameIsJoinable">
                <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.WELCOME)"><i class="fas fa-handshake mr-2"></i>Welcome</a>
            </div>
            <div v-if="!userPlayer && !gameIsJoinable">
                <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Leaderboard (Q)"><i class="fas fa-users mr-2"></i>Leaderboard</a>
            </div>
            <div v-if="userPlayer">
                <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Leaderboard (Q)"><i class="fas fa-users mr-2"></i>Leaderboard</a>
                <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.RESEARCH)" title="Research (R)"><i class="fas fa-flask mr-2"></i>Research</a>
                <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.GALAXY)" title="Galaxy (G)"><i class="fas fa-sun mr-2"></i>Galaxy</a>
                <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.LEDGER)" title="Ledger (L)"><i class="fas fa-file-invoice-dollar mr-2"></i>Ledger</a>
                <a class="dropdown-item" v-on:click="setMenuState(MENU_STATES.GAME_NOTES)" title="Notes (N)"><i class="fas fa-book-open mr-2"></i>Notes</a>
            </div>
            <a v-if="isLoggedIn && !isDarkModeExtra && !isDataCleaned" class="dropdown-item" v-on:click="setMenuState(MENU_STATES.INTEL)" title="Intel (I)"><i class="fas fa-chart-line mr-2"></i>Intel</a>
            <a :href="documentationUrl" class="dropdown-item" target="_blank"><i class="far fa-question-circle mr-2"></i>How to Play</a>
            <a v-if="isLoggedIn" class="dropdown-item" v-on:click="setMenuState(MENU_STATES.OPTIONS)" title="Options (O)"><i class="fas fa-cog mr-2"></i>Options</a>
            <a v-if="isLoggedIn" class="dropdown-item" v-on:click="goToMainMenu()"><i class="fas fa-chevron-left mr-2"></i>Main Menu</a>
            <router-link v-if="!isLoggedIn" to="/" class="dropdown-item"><i class="fas fa-sign-in-alt mr-2"></i>Log In</router-link>
            <router-link v-if="!isLoggedIn" to="/account/create" class="dropdown-item"><i class="fas fa-user-plus mr-2"></i>Register</router-link>
        </div>
    </div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import router from '../../../router'
import MENU_STATES from '../../data/menuStates'
import GameContainer from '../../../game/container'

export default {
  components: {
      
  },
  props: {
      buttonClass: String,
      dropType: String
  },
  data () {
    return {
      MENU_STATES: MENU_STATES
    }
  },
  methods: {
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
    reloadPage () {
      window.location.reload()
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
      return this.$store.state.userId != null && GameHelper.gameHasOpenSlots(this.$store.state.game)
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
    },
    documentationUrl () {
      return process.env.VUE_APP_DOCUMENTATION_URL
    }
  }
}
</script>

<style scoped>
.pointer {
  cursor:pointer;
}
</style>
