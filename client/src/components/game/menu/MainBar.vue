<template>
<div class="menu">
    <game-info v-bind:credits="500" v-bind:nextProduction="game.state.nextTickDate" @onMenuStateChanged="onMenuStateChanged"/>

    <player-list v-bind:players="game.galaxy.players" @onPlayerSelected="onPlayerSelected"/>

    <div v-if="menuState == MENU_STATES.GALAXY">GALAXY</div>
    <div v-if="menuState == MENU_STATES.INTEL">INTEL</div>
    <div v-if="menuState == MENU_STATES.OPTIONS">OPTIONS</div>
    <div v-if="menuState == MENU_STATES.HELP">HELP</div>

    <welcome v-if="menuState == MENU_STATES.WELCOME" :game="game" v-on:onGameJoined="onGameJoined"/>
    <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" :game="game"/>
    <player v-if="menuState == MENU_STATES.PLAYER" :game="game" :player="menuArguments" :key="menuArguments._id"/>
    <research v-if="menuState == MENU_STATES.RESEARCH" :game="game"/>
    <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" :game="game" :star="menuArguments"/>
    <inbox v-if="menuState == MENU_STATES.INBOX" :game="game"/>
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
    'inbox': InboxVue
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
    let userPlayer = GameHelper.getUserPlayer(this.game, this.$store.state.userId)

    this.menuState = userPlayer ? 'leaderboard' : 'welcome'
  },
  methods: {
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
}

@media(max-width: 473px) {
    .menu {
        width: 100%;
    }
}
</style>
