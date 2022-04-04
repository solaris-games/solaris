<template>
    <div class="sidebar-menu">
      <div v-if="!userPlayer && gameIsJoinable">
        <a v-on:click="setMenuState(MENU_STATES.WELCOME)" title="Join Game"><i class="fas fa-handshake"></i></a>
      </div>
      <div v-if="!userPlayer && !gameIsJoinable">
        <a v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Leaderboard (Q)"><i class="fas fa-users"></i></a>
      </div>
      <div v-if="userPlayer">
        <a v-on:click="setMenuState(MENU_STATES.LEADERBOARD)" title="Leaderboard (Q)"><i class="fas fa-users"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.GALAXY)" title="Galaxy (G)"><i class="fas fa-sun"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.RESEARCH)" title="Research (R)"><i class="fas fa-flask"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE)" title="Bulk Upgrade (B)"><i class="fas fa-money-bill"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.DIPLOMACY)" title="Diplomacy (D)" v-if="isFormalAlliancesEnabled"><i class="fas fa-globe-americas"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.LEDGER)" title="Ledger (L)" v-if="isTradeEnabled"><i class="fas fa-file-invoice-dollar"></i></a>
        <a v-on:click="setMenuState(MENU_STATES.GAME_NOTES)" title="Notes (N)"><i class="fas fa-book-open"></i></a>
      </div>
      <a v-if="isLoggedIn" v-on:click="setMenuState(MENU_STATES.COMBAT_CALCULATOR)" title="Calculator (C)"><i class="fas fa-calculator"></i></a>
      <a v-if="isLoggedIn" v-on:click="setMenuState(MENU_STATES.RULER)" title="Ruler (V)"><i class="fas fa-ruler"></i></a>
      <a v-if="isLoggedIn && !isDarkModeExtra && !isDataCleaned" v-on:click="setMenuState(MENU_STATES.INTEL)" title="Intel (I)"><i class="fas fa-chart-line"></i></a>
      <a v-if="isLoggedIn" v-on:click="setMenuState(MENU_STATES.OPTIONS)" title="Options (O)"><i class="fas fa-cog"></i></a>
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

.sidebar-menu {
  height: 100%;
}

a {
  display: block;
  text-align: center;
  font-size: 30px;
  margin-bottom: 20px;
  margin-left: 12px;
  margin-right: 12px;
  cursor: pointer;
}
</style>
