<template>
<div class="menu">
    <game-info :game="game" v-bind:nextProduction="game.state.nextTickDate" @onMenuStateChanged="onMenuStateChanged"/>

    <player-list v-bind:players="game.galaxy.players" @onPlayerSelected="onPlayerSelected"/>

    <div class="menu-content bg-light" v-if="menuState">
      <div v-if="menuState == MENU_STATES.OPTIONS">OPTIONS</div>
      <div v-if="menuState == MENU_STATES.HELP">HELP</div>

      <welcome v-if="menuState == MENU_STATES.WELCOME" @onCloseRequested="onCloseRequested" :game="game"/>
      <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" @onCloseRequested="onCloseRequested" :game="game"/>
      <player v-if="menuState == MENU_STATES.PLAYER" @onCloseRequested="onCloseRequested" :game="game" :player="menuArguments" :key="menuArguments._id" @onViewConversationRequested="onConversationOpenRequested"/>
      <research v-if="menuState == MENU_STATES.RESEARCH" @onCloseRequested="onCloseRequested" :game="game"/>
      <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" @onCloseRequested="onCloseRequested" :game="game" :star="menuArguments" @onViewConversationRequested="onConversationOpenRequested"/>
      <carrier-detail v-if="menuState == MENU_STATES.CARRIER_DETAIL" @onCloseRequested="onCloseRequested" :game="game" :carrier="menuArguments" @onShipTransferRequested="onShipTransferRequested" @onViewConversationRequested="onConversationOpenRequested"/>
      <ship-transfer v-if="menuState == MENU_STATES.SHIP_TRANSFER" @onCloseRequested="onCloseRequested" :game="game" :transfer="menuArguments" @onShipsTransferred="onShipsTransferred" @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <inbox v-if="menuState == MENU_STATES.INBOX" @onCloseRequested="onCloseRequested" :game="game" @onConversationOpenRequested="onConversationOpenRequested"/>
      <conversation v-if="menuState == MENU_STATES.CONVERSATION" @onCloseRequested="onCloseRequested" :game="game" :fromPlayerId="menuArguments"/>
      <intel v-if="menuState == MENU_STATES.INTEL" @onCloseRequested="onCloseRequested" :game="game"/>
      <galaxy v-if="menuState == MENU_STATES.GALAXY" @onCloseRequested="onCloseRequested" :game="game"/>
      <bulk-infrastructure-upgrade v-if="menuState == MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE" @onCloseRequested="onCloseRequested" :game="game"/>
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
import ShipTransferVue from '../carrier/ShipTransfer.vue'
import InboxVue from '../inbox/Inbox.vue'
import ConversationVue from '../inbox/Conversation.vue'
import IntelVue from '../intel/Intel.vue'
import GalaxyVue from '../galaxy/Galaxy.vue'
import BulkInfrastructureUpgradeVue from '../star/BulkInfrastructureUpgrade.vue'
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
    'ship-transfer': ShipTransferVue,
    'inbox': InboxVue,
    'conversation': ConversationVue,
    'intel': IntelVue,
    'galaxy': GalaxyVue,
    'bulk-infrastructure-upgrade': BulkInfrastructureUpgradeVue
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
  methods: {
    changeMenuState (state, args) {
      this.onMenuStateChanged({
        state,
        args
      })
    },
    onMenuStateChanged (e) {
      this.$emit('onMenuStateChanged', e)
    },
    onCloseRequested (e) {
      this.changeMenuState(null, null)
    },
    onPlayerSelected (e) {
      this.$emit('onPlayerSelected', e)
    },
    onConversationOpenRequested (e) {
      this.changeMenuState('conversation', e)
    },
    onShipTransferRequested (e) {
      this.changeMenuState('shipTransfer', e)
    },
    onShipsTransferred (e) {
      this.changeMenuState('carrierDetail', e)
    },
    onOpenCarrierDetailRequested (e) {
      this.changeMenuState('carrierDetail', e)
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
