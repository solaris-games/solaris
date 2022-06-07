<template>
<div class="menu-page container" v-if="player">
    <menu-title title="Trade" @onCloseRequested="onCloseRequested">
      <button @click="onOpenPlayerDetailRequested" class="btn btn-sm btn-outline-primary"><i class="fas fa-user"></i> Profile</button>
      <button @click="onOpenPrevPlayerDetailRequested" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-chevron-left"></i></button>
      <button @click="onOpenNextPlayerDetailRequested" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-chevron-right"></i></button>
      <button @click="panToPlayer" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <player-title :player="player"/>

    <!-- <table class="table table-sm" v-if="ledger">
      <tbody>
        <ledger-row :ledger="ledger"/>
      </tbody>
    </table> -->

    <player-trade :playerId="playerId"/>

    <h4 v-if="player && player.research" class="mt-2">Technology</h4>
    
    <research v-if="player && player.research" :playerId="player._id"/>
    
    <trade-history v-if="player" :toPlayerId="player._id"/>

    <!-- <loading-spinner :loading="isLoadingLedger"/> -->
</div>
</template>

<script>
import LoadingSpinnerVue from '../../../components/LoadingSpinner'
import MenuTitle from '../MenuTitle'
import PlayerTitleVue from './PlayerTitle'
import Research from './Research'
import PlayerTradeVue from './PlayerTrade'
import LedgerRowVue from '../ledger/LedgerRow'
import TradeHistoryVue from './TradeHistory'
import GameHelper from '../../../../services/gameHelper'
import GameContainer from '../../../../game/container'

export default {
  components: {
    'loading-spinner': LoadingSpinnerVue,
    'menu-title': MenuTitle,
    'player-title': PlayerTitleVue,
    'research': Research,
    'player-trade': PlayerTradeVue,
    'ledger-row': LedgerRowVue,
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
      ledger: null,
      isLoadingLedger: false
    }
  },
  async mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.playerIndex = this.$store.state.game.galaxy.players.indexOf(this.player)

    // await this.loadLedger()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    panToPlayer (e) {
      GameContainer.map.panToPlayer(this.$store.state.game, this.player)
    },
    onOpenPrevPlayerDetailRequested (e) {
      let prevIndex = this.playerIndex - 1

      if (prevIndex < 0) {
        prevIndex = this.$store.state.game.galaxy.players.length - 1
      }

      this.onOpenTradeRequested(prevIndex)
    },
    onOpenNextPlayerDetailRequested (e) {
      let nextIndex = this.playerIndex + 1

      if (nextIndex > this.$store.state.game.galaxy.players.length - 1) {
        nextIndex = 0
      }

      this.onOpenTradeRequested(nextIndex)
    },
    onOpenTradeRequested (e) {
      let player = this.$store.state.game.galaxy.players[e]

      this.$emit('onOpenTradeRequested', player._id)
    },
    onOpenPlayerDetailRequested (e) {
      let player = this.$store.state.game.galaxy.players[this.playerIndex]

      this.$emit('onOpenPlayerDetailRequested', player._id)
    }//,
    // async loadLedger () {
    //   try {
    //     this.isLoadingLedger = true

    //     let response = await LedgerApiService.getLedger(this.$store.state.game._id)

    //     if (response.status === 200) {
    //       this.ledger = response.data[0]
    //     }
    //   } catch (err) {
    //     console.error(err)
    //   }

    //   this.isLoadingLedger = false
    // }
  }
}
</script>

<style scoped>
</style>
