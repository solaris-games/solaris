<template>
    <div>
      <div v-if="!userPlayer && gameIsJoinable">
        <a v-on:click="setMenuState(MENU_STATES.WELCOME)" title="Join Game"><i class="fas fa-handshake mr-2"></i></a>
      </div>
      <div v-if="!userPlayer && !gameIsJoinable">
        <a v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Leaderboard (Q)"><i class="fas fa-users mr-2"></i></a>
      </div>
      <div v-if="userPlayer">
        <a v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Leaderboard (Q)"><i class="fas fa-users mr-2"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.RESEARCH)" title="Research (R)"><i class="fas fa-flask mr-2"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.GALAXY)" title="Galaxy (G)"><i class="fas fa-sun mr-2"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.DIPLOMACY)" title="Diplomacy (D)" v-if="isFormalAlliancesEnabled"><i class="fas fa-globe-americas mr-2"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.LEDGER)" title="Ledger (L)" v-if="isTradeEnabled"><i class="fas fa-file-invoice-dollar mr-2"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.GAME_NOTES)" title="Notes (N)"><i class="fas fa-book-open mr-2"></i></a>
      </div>
      <a v-if="isLoggedIn && !isDarkModeExtra && !isDataCleaned" v-on:click="setMenuState(MENU_STATES.INTEL)" title="Intel (I)"><i class="fas fa-chart-line mr-2"></i></a>
      <a :href="documentationUrl" target="_blank" title="How to Play"><i class="far fa-question-circle mr-2"></i></a>
      <a v-if="isLoggedIn" v-on:click="setMenuState(MENU_STATES.OPTIONS)" title="Options (O)"><i class="fas fa-cog mr-2"></i></a>
      <router-link v-if="isLoggedIn" to="/game/active-games" title="My Games"><i class="fas fa-dice mr-2"></i></router-link>
      <a v-if="isLoggedIn" v-on:click="goToMainMenu()" title="Main Menu"><i class="fas fa-chevron-left mr-2"></i></a>
      <router-link v-if="!isLoggedIn" to="/" title="Log In"><i class="fas fa-sign-in-alt mr-2"></i></router-link>
      <router-link v-if="!isLoggedIn" to="/account/create" title="Register"><i class="fas fa-user-plus mr-2"></i></router-link>
    </div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import DiplomacyHelper from '../../../services/diplomacyHelper'
import router from '../../../router'
import MENU_STATES from '../../data/menuStates'
import GameContainer from '../../../game/container'

export default {
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
    }
  },
  computed: {
    game () {
      return this.$store.state.game
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
    },
    isFormalAlliancesEnabled () {
      return DiplomacyHelper.isFormalAlliancesEnabled(this.$store.state.game)
    },
    isTradeEnabled () {
      return GameHelper.isTradeEnabled(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
.pointer {
  cursor:pointer;
}

a {
  display: block;
  text-align: center;
  font-size: 30px;
  margin-bottom: 20px;
  margin-left: 12px;
  margin-right: 8px;
  cursor: pointer;
}
</style>
