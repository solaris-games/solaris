<template>
<div>
  <header-bar @onMenuStateChanged="onMenuStateChanged"/>

  <div class="menu">
    <player-list v-bind:players="game.galaxy.players" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <div class="menu-content bg-dark" v-if="menuState">
      <!-- <div v-if="menuState == MENU_STATES.OPTIONS">OPTIONS</div>
      <div v-if="menuState == MENU_STATES.HELP">HELP</div> -->

      <welcome v-if="menuState == MENU_STATES.WELCOME" @onCloseRequested="onCloseRequested"/>
      <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" @onCloseRequested="onCloseRequested"/>
      <player v-if="menuState == MENU_STATES.PLAYER" @onCloseRequested="onCloseRequested" :playerId="menuArguments" :key="menuArguments"
        @onViewConversationRequested="onConversationOpenRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <research v-if="menuState == MENU_STATES.RESEARCH" @onCloseRequested="onCloseRequested"/>
      <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" :starId="menuArguments" :key="menuArguments"
        @onCloseRequested="onCloseRequested" 
        @onViewConversationRequested="onConversationOpenRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"/>
      <carrier-detail v-if="menuState == MENU_STATES.CARRIER_DETAIL" @onCloseRequested="onCloseRequested" :carrierId="menuArguments" 
        @onShipTransferRequested="onShipTransferRequested" 
        @onEditWaypointsRequested="onEditWaypointsRequested" 
        @onEditWaypointRequested="onEditWaypointRequested" 
        @onViewConversationRequested="onConversationOpenRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"/>
      <carrier-waypoints v-if="menuState == MENU_STATES.CARRIER_WAYPOINTS" @onCloseRequested="onCloseRequested" :carrierId="menuArguments" @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <carrier-waypoint v-if="menuState == MENU_STATES.CARRIER_WAYPOINT_DETAIL" @onCloseRequested="onCloseRequested" :carrierId="menuArguments.carrier" :waypoint="menuArguments.waypoint" @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <combat-calculator v-if="menuState == MENU_STATES.COMBAT_CALCULATOR" @onCloseRequested="onCloseRequested"/>
      <ship-transfer v-if="menuState == MENU_STATES.SHIP_TRANSFER" @onCloseRequested="onCloseRequested" :carrierId="menuArguments" @onShipsTransferred="onShipsTransferred" @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <inbox v-if="menuState == MENU_STATES.INBOX" 
        @onCloseRequested="onCloseRequested" 
        @onConversationOpenRequested="onConversationOpenRequested" 
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <conversation v-if="menuState == MENU_STATES.CONVERSATION" @onCloseRequested="onCloseRequested" :fromPlayerId="menuArguments"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"/>
      <intel v-if="menuState == MENU_STATES.INTEL" @onCloseRequested="onCloseRequested" :compareWithPlayerId="menuArguments"/>
      <galaxy v-if="menuState == MENU_STATES.GALAXY" 
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <bulk-infrastructure-upgrade v-if="menuState == MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE" @onCloseRequested="onCloseRequested"/>
      <map-object-selector v-if="menuState == MENU_STATES.MAP_OBJECT_SELECTOR" @onCloseRequested="onCloseRequested" :mapObjects="menuArguments" @onOpenStarDetailRequested="onOpenStarDetailRequested" @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested" @onEditWaypointsRequested="onEditWaypointsRequested"/>
    </div>
  </div>
</div>
</template>

<script>
import MENU_STATES from '../../data/menuStates'
import AudioService from '../../../game/audio'
import PlayerListVue from './PlayerList.vue'
import LeaderboardVue from '../leaderboard/Leaderboard.vue'
import PlayerVue from '../player/Player.vue'
import WelcomeVue from '../welcome/Welcome.vue'
import ResearchVue from '../research/Research.vue'
import StarDetailVue from '../star/StarDetail.vue'
import CarrierDetailVue from '../carrier/CarrierDetail.vue'
import CarrierWaypointsVue from '../carrier/CarrierWaypoints.vue'
import CarrierWaypointVue from '../carrier/CarrierWaypoint.vue'
import ShipTransferVue from '../carrier/ShipTransfer.vue'
import InboxVue from '../inbox/Inbox.vue'
import ConversationVue from '../inbox/Conversation.vue'
import IntelVue from '../intel/Intel.vue'
import GalaxyVue from '../galaxy/Galaxy.vue'
import BulkInfrastructureUpgradeVue from '../star/BulkInfrastructureUpgrade.vue'
import MapObjectSelectorVue from './MapObjectSelector.vue'
import GameHelper from '../../../services/gameHelper'
import CombatCalculatorVue from '../carrier/CombatCalculator.vue'
import HeaderBarVue from './HeaderBar'

export default {
  components: {
    'header-bar': HeaderBarVue,
    'welcome': WelcomeVue,
    'player-list': PlayerListVue,
    'leaderboard': LeaderboardVue,
    'player': PlayerVue,
    'research': ResearchVue,
    'star-detail': StarDetailVue,
    'carrier-detail': CarrierDetailVue,
    'carrier-waypoints': CarrierWaypointsVue,
    'carrier-waypoint': CarrierWaypointVue,
    'combat-calculator': CombatCalculatorVue,
    'ship-transfer': ShipTransferVue,
    'inbox': InboxVue,
    'conversation': ConversationVue,
    'intel': IntelVue,
    'galaxy': GalaxyVue,
    'bulk-infrastructure-upgrade': BulkInfrastructureUpgradeVue,
    'map-object-selector': MapObjectSelectorVue
  },
  props: {
    menuState: String,
    menuArguments: [Object, String, Array]
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
    onConversationOpenRequested (e) {
      this.changeMenuState('conversation', e)
    },
    onViewCompareIntelRequested (e) {
      this.changeMenuState(MENU_STATES.INTEL, e)
    },
    onShipTransferRequested (e) {
      this.changeMenuState('shipTransfer', e)
    },
    onShipsTransferred (e) {
      this.changeMenuState('carrierDetail', e)
    },
    onOpenCarrierDetailRequested (e) {
      this.changeMenuState('carrierDetail', e)
    },
    onOpenStarDetailRequested (e) {
      this.changeMenuState(MENU_STATES.STAR_DETAIL, e)
    },
    onOpenPlayerDetailRequested (e) {
      this.changeMenuState(MENU_STATES.PLAYER, e)
    },
    onEditWaypointsRequested (e) {
      this.changeMenuState(MENU_STATES.CARRIER_WAYPOINTS, e)
    },
    onEditWaypointRequested (e) {
      this.changeMenuState(MENU_STATES.CARRIER_WAYPOINT_DETAIL, e)
    }
  },
  computed: {
    game () {
      return this.$store.state.game
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
