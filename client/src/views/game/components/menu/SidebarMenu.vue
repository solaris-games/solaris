<template>
  <div class="sidebar-menu d-none d-md-block" :class="{'header-bar-bg':!$isHistoricalMode(),'bg-dark':$isHistoricalMode()}">
    <div class="sidebar-menu-top">
      <div v-if="!userPlayer && gameIsJoinable">
        <sidebar-menu-item :menuState="MENU_STATES.WELCOME" tooltip="Join Game" iconClass="fas fa-handshake" />
      </div>
      <div v-if="!userPlayer && !gameIsJoinable">
        <sidebar-menu-item :menuState="MENU_STATES.LEADERBOARD" tooltip="Leaderboard (Q)" iconClass="fas fa-users" />
      </div>
      <sidebar-menu-item :menuState="MENU_STATES.GALAXY" tooltip="Galaxy (G)" iconClass="fas fa-sun" />
      <div v-if="userPlayer">
        <sidebar-menu-item :menuState="MENU_STATES.LEADERBOARD" tooltip="Leaderboard (Q)" iconClass="fas fa-users" />
        <sidebar-menu-item :menuState="MENU_STATES.RESEARCH" tooltip="Research (R)" iconClass="fas fa-flask" />
        <sidebar-menu-item :menuState="MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE" tooltip="Bulk Upgrade (B)" iconClass="fas fa-money-bill" />
        <sidebar-menu-item v-if="isFormalAlliancesEnabled" :menuState="MENU_STATES.DIPLOMACY" tooltip="Diplomacy (D)" iconClass="fas fa-globe-americas" />
        <sidebar-menu-item v-if="isTradeEnabled" :menuState="MENU_STATES.LEDGER" tooltip="Ledger (L)" iconClass="fas fa-file-invoice-dollar" />
        <sidebar-menu-item :menuState="MENU_STATES.GAME_NOTES" tooltip="Notes (N)" iconClass="fas fa-book-open" />
      </div>
      <div v-if="isLoggedIn">
        <sidebar-menu-item :menuState="MENU_STATES.COMBAT_CALCULATOR" tooltip="Calculator (C)" iconClass="fas fa-calculator" />
        <sidebar-menu-item :menuState="MENU_STATES.RULER" tooltip="Ruler (V)" iconClass="fas fa-ruler" />
        <sidebar-menu-item v-if="!isDarkModeExtra && !isDataCleaned && (gameIsInProgress || gameIsFinished)" :menuState="MENU_STATES.INTEL" tooltip="Intel (I)" iconClass="fas fa-chart-line" />
        <sidebar-menu-item :menuState="MENU_STATES.STATISTICS" tooltip="Statistics" iconClass="fas fa-chart-bar" />
      </div>
    </div>

    <div class="sidebar-menu-bottom" v-if="canDisplayBottomBar">
      <sidebar-menu-item :menuState="MENU_STATES.OPTIONS" tooltip="Options (O)" iconClass="fas fa-cog" />
      <a :href="documentationUrl" target="_blank" title="How to Play"><i class="far fa-question-circle"></i></a>
      <router-link v-if="isLoggedIn" to="/game/active-games" title="My Games"><i class="fas fa-dice"></i></router-link>
      <a v-if="isLoggedIn" v-on:click="goToMainMenu()" title="Main Menu"><i class="fas fa-chevron-left"></i></a>
      <router-link v-if="!isLoggedIn" to="/" title="Log In"><i class="fas fa-sign-in-alt"></i></router-link>
      <router-link v-if="!isLoggedIn" to="/account/create" title="Register"><i class="fas fa-user-plus"></i></router-link>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import DiplomacyHelper from '../../../../services/diplomacyHelper'
import router from '../../../../router'
import MENU_STATES from '../../../../services/data/menuStates'
import SidebarMenuItem from './SidebarMenuItem.vue'

export default {
  components: {
    'sidebar-menu-item': SidebarMenuItem
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
    isFormalAlliancesEnabled () {
      return DiplomacyHelper.isFormalAlliancesEnabled(this.$store.state.game)
    },
    isTradeEnabled () {
      return GameHelper.isTradeEnabled(this.$store.state.game)
    },
    documentationUrl () {
      return import.meta.env.VUE_APP_DOCUMENTATION_URL
    },
    canDisplayBottomBar () {
      return window.innerHeight >= 750
    },
    gameIsInProgress () {
      return GameHelper.isGameInProgress(this.$store.state.game)
    },
    gameIsFinished () {
      return GameHelper.isGameFinished(this.$store.state.game)
    },
  }
}
</script>

<style scoped>
.sidebar-menu {
  position:absolute;
  padding-top: 45px;
  height: 100%;
}

.sidebar-menu-top, .sidebar-menu-bottom {
  width: 50px;
}

.sidebar-menu-bottom {
  position: absolute;
  bottom: 0;
}

a {
  display: block;
  text-align: center;
  font-size: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 12px;
  padding-right: 12px;
  cursor: pointer;
  color: white !important;
}

a:hover {
  color: #375a7f !important;
}
</style>
