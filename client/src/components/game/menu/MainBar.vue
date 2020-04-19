<template>
<div class="menu">
    <game-info :game="game" v-bind:nextProduction="game.state.nextTickDate" @onMenuStateChanged="onMenuStateChanged"/>

    <player-list v-bind:players="game.galaxy.players" @onPlayerSelected="onPlayerSelected"/>

    <div class="menu-content bg-light">
      <div v-if="menuState == MENU_STATES.OPTIONS">OPTIONS</div>
      <div v-if="menuState == MENU_STATES.HELP">HELP</div>

      <welcome v-if="menuState == MENU_STATES.WELCOME" :game="game" v-on:onGameJoined="onGameJoined"/>
      <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" :game="game"/>
      <player v-if="menuState == MENU_STATES.PLAYER" :game="game" :userPlayer="getUserPlayer()" :player="menuArguments" :key="menuArguments._id"/>
      <research v-if="menuState == MENU_STATES.RESEARCH" :game="game"/>
      <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" :game="game" :star="menuArguments"/>
      <carrier-detail v-if="menuState == MENU_STATES.CARRIER_DETAIL" :game="game" :carrier="menuArguments"/>
      <inbox v-if="menuState == MENU_STATES.INBOX" :game="game" @onConversationOpenRequested="onConversationOpenRequested"/>
      <conversation v-if="menuState == MENU_STATES.CONVERSATION" :game="game" :fromPlayerId="menuArguments"/>
      <intel v-if="menuState == MENU_STATES.INTEL" :game="game"/>
      <galaxy v-if="menuState == MENU_STATES.GALAXY" :game="game"/>
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
import CarrierDetailVue from '../carrier/CarrierDetail.vue'
import InboxVue from '../inbox/Inbox.vue'
import ConversationVue from '../inbox/Conversation.vue'
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
    'carrier-detail': CarrierDetailVue,
    'inbox': InboxVue,
    'conversation': ConversationVue,
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
      return GameHelper.getUserPlayer(this.game)
    },
    onMenuStateChanged (e) {
      this.$emit('onMenuStateChanged', e)
    },
    onPlayerSelected (e) {
      this.$emit('onPlayerSelected', e)
    },
    onGameJoined (e) {
      this.$emit('onGameJoined', e)
    }, 
    onConversationOpenRequested (e) {
      this.menuState = 'conversation'
      this.menuArguments = e
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
