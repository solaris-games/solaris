<template>
<div>
  <header-bar class="header-bar" 
    @onMenuStateChanged="onMenuStateChanged"
    @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

  <div class="menu">
    <div class="header-buffer"></div>

    <not-logged-in-bar v-if="!isLoggedIn"/>

    <player-list @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <div class="menu-content bg-dark" v-if="menuState">
      <!-- <div v-if="menuState == MENU_STATES.OPTIONS">OPTIONS</div>
      <div v-if="menuState == MENU_STATES.HELP">HELP</div> -->

      <welcome v-if="menuState == MENU_STATES.WELCOME" @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player v-if="menuState == MENU_STATES.PLAYER" @onCloseRequested="onCloseRequested" :playerId="menuArguments" :key="menuArguments"
        @onViewConversationRequested="onViewConversationRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <research v-if="menuState == MENU_STATES.RESEARCH" @onCloseRequested="onCloseRequested"/>
      <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" :starId="menuArguments" :key="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onViewConversationRequested="onViewConversationRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"
        @onViewHireStarSpecialistRequested="onViewHireStarSpecialistRequested"
        @onBuildCarrierRequested="onBuildCarrierRequested"
        @onShipTransferRequested="onShipTransferRequested"/>
      <carrier-detail v-if="menuState == MENU_STATES.CARRIER_DETAIL" 
        @onCloseRequested="onCloseRequested" :carrierId="menuArguments" :key="menuArguments"
        @onShipTransferRequested="onShipTransferRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"
        @onEditWaypointRequested="onEditWaypointRequested"
        @onViewConversationRequested="onViewConversationRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onViewHireCarrierSpecialistRequested="onViewHireCarrierSpecialistRequested"
        @onCarrierRenameRequested="onCarrierRenameRequested" 
        @onViewCarrierCombatCalculatorRequested="onViewCarrierCombatCalculatorRequested"/>
      <carrier-waypoints v-if="menuState == MENU_STATES.CARRIER_WAYPOINTS"
        @onCloseRequested="onCloseRequested" :carrierId="menuArguments"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onEditWaypointRequested="onEditWaypointRequested"/>
      <carrier-waypoint v-if="menuState == MENU_STATES.CARRIER_WAYPOINT_DETAIL"
        @onCloseRequested="onCloseRequested"
        :carrierId="menuArguments.carrierId"
        :waypoint="menuArguments.waypoint"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <carrier-rename v-if="menuState == MENU_STATES.CARRIER_RENAME"
        @onCloseRequested="onCloseRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        :carrierId="menuArguments" />
      <combat-calculator v-if="menuState == MENU_STATES.COMBAT_CALCULATOR" 
        :carrierId="menuArguments"
        @onCloseRequested="onCloseRequested"/>
      <ship-transfer v-if="menuState == MENU_STATES.SHIP_TRANSFER" 
        @onCloseRequested="onCloseRequested" 
        :carrierId="menuArguments" 
        @onShipsTransferred="onShipsTransferred" 
        @onEditWaypointsRequested="onEditWaypointsRequested"/>
      <build-carrier v-if="menuState == MENU_STATES.BUILD_CARRIER"
        :starId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"/>
      <inbox v-if="menuState == MENU_STATES.INBOX"
        @onCloseRequested="onCloseRequested"
        @onViewConversationRequested="onViewConversationRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onCreateNewConversationRequested="onCreateNewConversationRequested"/>
      <intel v-if="menuState == MENU_STATES.INTEL" @onCloseRequested="onCloseRequested" :compareWithPlayerId="menuArguments"/>
      <galaxy v-if="menuState == MENU_STATES.GALAXY"
        :tab="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <bulk-infrastructure-upgrade v-if="menuState == MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE" @onCloseRequested="onCloseRequested"/>
      <map-object-selector v-if="menuState == MENU_STATES.MAP_OBJECT_SELECTOR" 
        @onCloseRequested="onCloseRequested" 
        :mapObjects="menuArguments" 
        @onOpenStarDetailRequested="onOpenStarDetailRequested" 
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested" 
        @onEditWaypointsRequested="onEditWaypointsRequested" 
        @onShipTransferRequested="onShipTransferRequested"
        @onBuildCarrierRequested="onBuildCarrierRequested"/>
      <ruler v-if="menuState == MENU_STATES.RULER" @onCloseRequested="onCloseRequested"/>
      <ledger v-if="menuState == MENU_STATES.LEDGER" @onCloseRequested="onCloseRequested" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <hire-specialist-carrier v-if="menuState == MENU_STATES.HIRE_SPECIALIST_CARRIER"
        :carrierId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <hire-specialist-star v-if="menuState == MENU_STATES.HIRE_SPECIALIST_STAR"
        :starId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      <game-notes v-if="menuState == MENU_STATES.GAME_NOTES"
        @onCloseRequested="onCloseRequested"/>
      <options v-if="menuState == MENU_STATES.OPTIONS"
        @onCloseRequested="onCloseRequested"/>
      <create-conversation v-if="menuState == MENU_STATES.CREATE_CONVERSATION"
        :participantIds="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenInboxRequested="onOpenInboxRequested"
        @onViewConversationRequested="onViewConversationRequested"/>
      <conversation v-if="menuState == MENU_STATES.CONVERSATION"
        :conversationId="menuArguments"
        :key="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenInboxRequested="onOpenInboxRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
    </div>
  </div>

  <footer-bar class="footer-bar d-xs-block d-sm-none" 
    @onMenuStateChanged="onMenuStateChanged"
    @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
</div>
</template>

<script>
import MENU_STATES from '../../data/menuStates'
import PlayerListVue from './PlayerList.vue'
import LeaderboardVue from '../leaderboard/Leaderboard.vue'
import PlayerVue from '../player/Player.vue'
import WelcomeVue from '../welcome/Welcome.vue'
import ResearchVue from '../research/Research.vue'
import StarDetailVue from '../star/StarDetail.vue'
import CarrierDetailVue from '../carrier/CarrierDetail.vue'
import CarrierWaypointsVue from '../carrier/CarrierWaypoints.vue'
import CarrierWaypointVue from '../carrier/CarrierWaypoint.vue'
import CarrierRenameVue from '../carrier/CarrierRename.vue'
import ShipTransferVue from '../carrier/ShipTransfer.vue'
import BuildCarrierVue from '../carrier/BuildCarrier.vue'
import InboxVue from '../inbox/Inbox.vue'
import IntelVue from '../intel/Intel.vue'
import GalaxyVue from '../galaxy/Galaxy.vue'
import BulkInfrastructureUpgradeVue from '../star/BulkInfrastructureUpgrade.vue'
import MapObjectSelectorVue from './MapObjectSelector.vue'
import GameHelper from '../../../services/gameHelper'
import CombatCalculatorVue from '../carrier/CombatCalculator.vue'
import RulerVue from '../ruler/Ruler.vue'
import HeaderBarVue from './HeaderBar'
import LedgerVue from '../ledger/Ledger.vue'
import HireSpecialistCarrierVue from '../specialist/HireSpecialistCarrier.vue'
import HireSpecialistStarVue from '../specialist/HireSpecialistStar.vue'
import GameNotesVue from '../notes/GameNotes.vue'
import OptionsVue from './Options.vue'
import ConversationCreateVue from '../inbox/conversations/ConversationCreate.vue'
import ConversationDetailVue from '../inbox/conversations/ConversationDetail.vue'
import FooterBarVue from './FooterBar.vue'
import NotLoggedInBarVue from './NotLoggedInBar'

export default {
  components: {
    'header-bar': HeaderBarVue,
    'footer-bar': FooterBarVue,
    'welcome': WelcomeVue,
    'player-list': PlayerListVue,
    'leaderboard': LeaderboardVue,
    'player': PlayerVue,
    'research': ResearchVue,
    'star-detail': StarDetailVue,
    'carrier-detail': CarrierDetailVue,
    'carrier-waypoints': CarrierWaypointsVue,
    'carrier-waypoint': CarrierWaypointVue,
    'carrier-rename': CarrierRenameVue,
    'combat-calculator': CombatCalculatorVue,
    'ship-transfer': ShipTransferVue,
    'build-carrier': BuildCarrierVue,
    'inbox': InboxVue,
    'intel': IntelVue,
    'galaxy': GalaxyVue,
    'bulk-infrastructure-upgrade': BulkInfrastructureUpgradeVue,
    'map-object-selector': MapObjectSelectorVue,
    'ruler': RulerVue,
    'ledger': LedgerVue,
    'hire-specialist-carrier': HireSpecialistCarrierVue,
    'hire-specialist-star': HireSpecialistStarVue,
    'game-notes': GameNotesVue,
    'options': OptionsVue,
    'create-conversation': ConversationCreateVue,
    'conversation': ConversationDetailVue,
    'not-logged-in-bar': NotLoggedInBarVue
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
    onViewConversationRequested (e) {
      if (e.conversationId) {
        this.changeMenuState(MENU_STATES.CONVERSATION, e.conversationId)
      } else if (e.participantIds) {
        this.changeMenuState(MENU_STATES.CREATE_CONVERSATION, e.participantIds)
      }
    },
    onViewCompareIntelRequested (e) {
      this.changeMenuState(MENU_STATES.INTEL, e)
    },
    onShipTransferRequested (e) {
      this.changeMenuState(MENU_STATES.SHIP_TRANSFER, e)
    },
    onShipsTransferred (e) {
      this.changeMenuState(MENU_STATES.CARRIER_DETAIL, e)
    },
    onOpenCarrierDetailRequested (e) {
      this.changeMenuState(MENU_STATES.CARRIER_DETAIL, e)
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
    },
    onOpenInboxRequested (e) {
      this.changeMenuState(MENU_STATES.INBOX, e)
    },
    onViewHireCarrierSpecialistRequested (e) {
      this.changeMenuState(MENU_STATES.HIRE_SPECIALIST_CARRIER, e)
    },
    onViewHireStarSpecialistRequested (e) {
      this.changeMenuState(MENU_STATES.HIRE_SPECIALIST_STAR, e)
    },
    onBuildCarrierRequested (e) {
      this.changeMenuState(MENU_STATES.BUILD_CARRIER, e)
    },
    onCarrierRenameRequested (e) {
      this.changeMenuState(MENU_STATES.CARRIER_RENAME, e)
    },
    onCreateNewConversationRequested (e) {
      this.changeMenuState(MENU_STATES.CREATE_CONVERSATION, e)
    },
    onViewCarrierCombatCalculatorRequested (e) {
      this.changeMenuState(MENU_STATES.COMBAT_CALCULATOR, e)
    }
  },
  computed: {
    game () {
      return this.$store.state.game
    },
    isLoggedIn () {
      return this.$store.state.userId != null
    }
  }
}
</script>

<style scoped>
.header-bar {
  position:absolute;
  height: 45px;
  z-index: 1;
}

.footer-bar {
  position:absolute;
  height: 52px;
  bottom: 0px;
  z-index: 1;
}

.header-buffer {
  height: 45px;
}

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
