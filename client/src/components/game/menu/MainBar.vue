<template>
<div class="menu">
    <game-info v-if="getUserPlayer()" v-bind:credits="getUserPlayer().cash" v-bind:nextProduction="game.state.nextTickDate" @onMenuStateChanged="onMenuStateChanged"/>
    <game-info v-if="!getUserPlayer()" v-bind:credits="0" v-bind:nextProduction="game.state.nextTickDate" @onMenuStateChanged="onMenuStateChanged"/>

    <player-list v-bind:players="game.galaxy.players" @onPlayerSelected="onPlayerSelected"/>

    <div class="menu-content">
      <div v-if="menuState == MENU_STATES.OPTIONS">OPTIONS</div>
      <div v-if="menuState == MENU_STATES.HELP">HELP</div>

      <welcome v-if="menuState == MENU_STATES.WELCOME" :game="game" v-on:onGameJoined="onGameJoined"/>
      <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" :game="game"/>
      <player v-if="menuState == MENU_STATES.PLAYER" :game="game" :player="menuArguments" :key="menuArguments._id"/>
      <research v-if="menuState == MENU_STATES.RESEARCH" :game="game"/>
      <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" :game="game" :star="menuArguments"/>
      <inbox v-if="menuState == MENU_STATES.INBOX" :game="game"/>
      <intel v-if="menuState == MENU_STATES.INTEL" :game="game"/>
      <galaxy v-if="menuState == MENU_STATES.GALAXY"/>
    </div>
</div>
</template>

<script>
import MENU_STATES from '../../data/menuStates'
import GameInfoVue from './GameInfo.vue'
import PlayerListVue from './PlayerList.vue'
import LeaderboardVue from '../leaderboard/Leaderboard.vue'
import PlayerVue from '../player/Player.vue'
import WelcomeVue from '../welcome/Welcome.vue'
import ResearchVue from '../research/Research.vue'
import StarDetailVue from '../star/StarDetail.vue'
import InboxVue from '../inbox/Inbox.vue'
import IntelVue from '../intel/Intel.vue'
import GalaxyVue from '../galaxy/Galaxy.vue'
import GameHelper from '../../../services/gameHelper'

export default {
  components: {
    'game-info': GameInfoVue,
    'welcome': WelcomeVue,
    'player-list': PlayerListVue,
    'leaderboard': LeaderboardVue,
    'player': PlayerVue,
    'research': ResearchVue,
    'star-detail': StarDetailVue,
    'inbox': InboxVue,
    'intel': IntelVue,
    'galaxy': GalaxyVue
  },
  props: {
    game: Object,
    menuState: String,
    menuArguments: Object
  },
  data () {
    return {
      MENU_STATES: MENU_STATES
    }
  },
  mounted () {
    // Check if the user is in this game, if not then show the welcome screen.
    this.menuState = this.getUserPlayer() ? 'leaderboard' : 'welcome'
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.game, this.$store.state.userId)
    },
    onMenuStateChanged (e) {
      this.$emit('onMenuStateChanged', e)
    },
    onPlayerSelected (e) {
      this.$emit('onPlayerSelected', e)
    },
    onGameJoined (e) {
      this.$emit('onGameJoined', e)
    }
  }
}
</script>

<style scoped>
.menu {
    position:absolute; /* This is a must otherwise the div overlays the map */
    width: 473px;
    max-height: 100%;
    overflow: auto;
    overflow-x: hidden;
}

::-webkit-scrollbar {
    width: 0px;
    background: transparent; /* make scrollbar transparent */
}

@media(max-width: 473px) {
    .menu {
        width: 100%;
    }
}
</style>
