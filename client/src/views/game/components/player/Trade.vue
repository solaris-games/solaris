<template>
<div class="menu-page container" v-if="player">
    <menu-title title="Trade" @onCloseRequested="onCloseRequested">
      <button @click="onOpenPlayerDetailRequested" class="btn btn-sm btn-outline-primary"><i class="fas fa-user"></i> Profile</button>
      <button @click="onOpenPrevPlayerDetailRequested" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-chevron-left"></i></button>
      <button @click="onOpenNextPlayerDetailRequested" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-chevron-right"></i></button>
      <button @click="panToPlayer" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <player-title :player="player"/>

    <player-trade :playerId="playerId"/>

    <h4 v-if="player && player.research" class="mt-2">Technology</h4>

    <research v-if="player && player.research" :playerId="player._id"/>

    <trade-history v-if="player" :toPlayerId="player._id"/>
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner.vue'
import MenuTitle from '../MenuTitle.vue'
import PlayerTitleVue from './PlayerTitle.vue'
import Research from './Research.vue'
import PlayerTradeVue from './PlayerTrade.vue'
import TradeHistoryVue from './TradeHistory.vue'
import GameHelper from '../../../../services/gameHelper'
import GameContainer from '../../../../game/container'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'player-title': PlayerTitleVue,
    'research': Research,
    'player-trade': PlayerTradeVue,
    'trade-history': TradeHistoryVue
  },
  props: {
    playerId: String
  },
  data () {
    return {
      player: null,
      userPlayer: null,
      playerIndex: 0,
      isLoadingLedger: false
    }
  },
  async mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.playerIndex = this.$store.state.game.galaxy.players.indexOf(this.player)
    this.leaderboard = GameHelper.getSortedLeaderboardPlayerList(this.$store.state.game)
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    panToPlayer (e) {
      GameContainer.panToPlayer(this.$store.state.game, this.player)
    },
    onOpenPrevPlayerDetailRequested (e) {
      let prevLeaderboardIndex = this.leaderboard.indexOf(this.player) - 1;

      if (prevLeaderboardIndex < 0) {
        prevLeaderboardIndex = this.leaderboard.length - 1;
      }

      let prevPlayer = this.leaderboard[prevLeaderboardIndex];

      this.onOpenTradeRequested(prevPlayer);
    },
    onOpenNextPlayerDetailRequested (e) {
      let nextLeaderboardIndex = this.leaderboard.indexOf(this.player) + 1;

      if (nextLeaderboardIndex > this.leaderboard.length - 1) {
        nextLeaderboardIndex = 0;
      }

      let nextPlayer = this.leaderboard[nextLeaderboardIndex];

      this.onOpenTradeRequested(nextPlayer);
    },
    onOpenTradeRequested (player) {
      this.$emit('onOpenTradeRequested', player._id)
    },
    onOpenPlayerDetailRequested (e) {
      let player = this.$store.state.game.galaxy.players[this.playerIndex]

      this.$emit('onOpenPlayerDetailRequested', player._id)
    }
  }
}
</script>

<style scoped>
</style>
