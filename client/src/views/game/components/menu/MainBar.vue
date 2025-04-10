<template>
<div>
  <header-bar class="header-bar"
    @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

  <sidebar-menu />

  <div class="menu">
    <not-logged-in-bar v-if="!isLoggedIn"/>
    <spectating-warning-bar/>

    <player-list @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <div class="menu-content" v-if="menuState">
      <welcome v-if="menuState == MENU_STATES.WELCOME" @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onViewSettingsRequested="onViewSettingsRequested"/>
      <tutorial v-if="menuState == MENU_STATES.TUTORIAL" @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      <leaderboard v-if="menuState == MENU_STATES.LEADERBOARD" @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onViewSettingsRequested="onViewSettingsRequested"/>
      <player v-if="menuState == MENU_STATES.PLAYER" @onCloseRequested="onCloseRequested" :playerId="menuArguments" :key="menuArguments"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenTradeRequested="onOpenTradeRequested"
        @onOpenPurchasePlayerBadgeRequested="onOpenPurchasePlayerBadgeRequested"
        @onOpenReportPlayerRequested="onOpenReportPlayerRequested"
        @onViewColourOverrideRequested="onViewColourOverrideRequested"
      />
      <trade v-if="menuState == MENU_STATES.TRADE"
        @onCloseRequested="onCloseRequested" :playerId="menuArguments" :key="menuArguments"
        @onOpenTradeRequested="onOpenTradeRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <research v-if="menuState == MENU_STATES.RESEARCH" @onCloseRequested="onCloseRequested"/>
      <star-detail v-if="menuState == MENU_STATES.STAR_DETAIL" :starId="menuArguments" :key="menuArguments"
        @onCloseRequested="onCloseRequested"
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
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <event-log v-if="menuState == MENU_STATES.EVENT_LOG"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <intel v-if="menuState == MENU_STATES.INTEL" @onCloseRequested="onCloseRequested" :compareWithPlayerId="menuArguments"/>
      <galaxy v-if="menuState == MENU_STATES.GALAXY"
        :tab="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <bulk-infrastructure-upgrade v-if="menuState == MENU_STATES.BULK_INFRASTRUCTURE_UPGRADE"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      <map-object-selector v-if="menuState == MENU_STATES.MAP_OBJECT_SELECTOR"
        @onCloseRequested="onCloseRequested"
        :mapObjects="menuArguments"
        @onEditWaypointsRequested="onEditWaypointsRequested"
        @onShipTransferRequested="onShipTransferRequested"
        @onBuildCarrierRequested="onBuildCarrierRequested"/>
      <ruler v-if="menuState == MENU_STATES.RULER" @onCloseRequested="onCloseRequested"/>
      <ledger v-if="menuState == MENU_STATES.LEDGER" @onCloseRequested="onCloseRequested" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <diplomacy v-if="menuState == MENU_STATES.DIPLOMACY" @onCloseRequested="onCloseRequested" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <hire-specialist-carrier v-if="menuState == MENU_STATES.HIRE_SPECIALIST_CARRIER"
        :carrierId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <hire-specialist-star v-if="menuState == MENU_STATES.HIRE_SPECIALIST_STAR"
        :starId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onReloadGameRequested="onReloadGameRequested"/>
      <game-notes v-if="menuState == MENU_STATES.GAME_NOTES"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <options v-if="menuState == MENU_STATES.OPTIONS"
        @onCloseRequested="onCloseRequested"/>
      <settings v-if="menuState == MENU_STATES.SETTINGS"
        @onCloseRequested="onCloseRequested"/>
      <create-conversation v-if="menuState == MENU_STATES.CREATE_CONVERSATION"
        :participantIds="menuArguments"
        @onCloseRequested="onCloseRequested"/>
      <conversation v-if="menuState == MENU_STATES.CONVERSATION"
        :conversationId="menuArguments"
        :key="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <player-badge-shop v-if="menuState == MENU_STATES.PLAYER_BADGE_SHOP"
        :recipientPlayerId="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <report-player v-if="menuState == MENU_STATES.REPORT_PLAYER"
        :args="menuArguments"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <spectators v-if="menuState == MENU_STATES.SPECTATORS"
        @onCloseRequested="onCloseRequested"/>
    </div>

    <div class="spacing-footer d-block d-sm-none"></div>
  </div>

  <footer-bar class="footer-bar d-xs-block d-sm-none"
    @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
</div>
</template>

<script>
import MENU_STATES from '../../../../services/data/menuStates'
import PlayerListVue from './PlayerList.vue'
import LeaderboardVue from '../leaderboard/Leaderboard.vue'
import PlayerVue from '../player/Player.vue'
import TradeVue from '../player/Trade.vue'
import WelcomeVue from '../welcome/Welcome.vue'
import TutorialVue from '../tutorial/Tutorial.vue'
import ResearchVue from '../research/Research.vue'
import StarDetailVue from '../star/StarDetail.vue'
import CarrierDetailVue from '../carrier/CarrierDetail.vue'
import CarrierWaypointsVue from '../carrier/CarrierWaypoints.vue'
import CarrierWaypointVue from '../carrier/CarrierWaypoint.vue'
import CarrierRenameVue from '../carrier/CarrierRename.vue'
import ShipTransferVue from '../carrier/ShipTransfer.vue'
import BuildCarrierVue from '../carrier/BuildCarrier.vue'
import InboxVue from '../inbox/Inbox.vue'
import EventLogVue from '../eventLog/EventLog.vue'
import IntelVue from '../intel/Intel.vue'
import GalaxyVue from '../galaxy/Galaxy.vue'
import BulkInfrastructureUpgradeVue from '../star/BulkInfrastructureUpgrade.vue'
import MapObjectSelectorVue from './MapObjectSelector.vue'
import CombatCalculatorVue from '../carrier/CombatCalculator.vue'
import RulerVue from '../ruler/Ruler.vue'
import HeaderBarVue from './HeaderBar.vue'
import SidebarMenuVue from './SidebarMenu.vue'
import LedgerVue from '../ledger/Ledger.vue'
import DiplomacyVue from '../diplomacy/Diplomacy.vue'
import HireSpecialistCarrierVue from '../specialist/HireSpecialistCarrier.vue'
import HireSpecialistStarVue from '../specialist/HireSpecialistStar.vue'
import GameNotesVue from '../notes/GameNotes.vue'
import OptionsVue from './Options.vue'
import SettingsVue from '../settings/Settings.vue'
import ConversationCreateVue from '../inbox/conversations/ConversationCreate.vue'
import ConversationDetailVue from '../inbox/conversations/ConversationDetail.vue'
import FooterBarVue from './FooterBar.vue'
import NotLoggedInBarVue from './NotLoggedInBar.vue'
import SpectatingWarningBarVue from './SpectatingWarningBar.vue'
import PlayerBadgeShopVue from '../badges/PlayerBadgeShop.vue'
import ReportPlayerVue from '../report/ReportPlayer.vue'
import SpectatorVue from '../spectators/Spectators.vue'
import { inject } from 'vue'
import { eventBusInjectionKey } from '../../../../eventBus'
import MenuEventBusEventNames from '../../../../eventBusEventNames/menu'

export default {
  components: {
    'header-bar': HeaderBarVue,
    'footer-bar': FooterBarVue,
    'sidebar-menu': SidebarMenuVue,
    'welcome': WelcomeVue,
    'tutorial': TutorialVue,
    'player-list': PlayerListVue,
    'leaderboard': LeaderboardVue,
    'player': PlayerVue,
    'trade': TradeVue,
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
    'event-log': EventLogVue,
    'intel': IntelVue,
    'galaxy': GalaxyVue,
    'bulk-infrastructure-upgrade': BulkInfrastructureUpgradeVue,
    'map-object-selector': MapObjectSelectorVue,
    'ruler': RulerVue,
    'ledger': LedgerVue,
    'diplomacy': DiplomacyVue,
    'hire-specialist-carrier': HireSpecialistCarrierVue,
    'hire-specialist-star': HireSpecialistStarVue,
    'game-notes': GameNotesVue,
    'options': OptionsVue,
    'settings': SettingsVue,
    'create-conversation': ConversationCreateVue,
    'conversation': ConversationDetailVue,
    'not-logged-in-bar': NotLoggedInBarVue,
    'spectating-warning-bar': SpectatingWarningBarVue,
    'player-badge-shop': PlayerBadgeShopVue,
    'report-player': ReportPlayerVue,
    'spectators': SpectatorVue
  },
  data () {
    return {
      MENU_STATES: MENU_STATES,
      menuState: null,
      menuArguments: null
    }
  },
  setup() {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  mounted () {
    this.eventBus.on(MenuEventBusEventNames.OnMenuRequested, this.onMenuRequested);
    this.eventBus.on(MenuEventBusEventNames.OnCreateNewConversationRequested, this.onCreateNewConversationRequested);
    this.eventBus.on(MenuEventBusEventNames.OnViewConversationRequested, this.onViewConversationRequested);
    this.eventBus.on(MenuEventBusEventNames.OnOpenInboxRequested, this.onOpenInboxRequested);
  },
  unmounted () {
    this.eventBus.off(MenuEventBusEventNames.OnMenuRequested, this.onMenuRequested);
    this.eventBus.off(MenuEventBusEventNames.OnCreateNewConversationRequested, this.onCreateNewConversationRequested);
    this.eventBus.off(MenuEventBusEventNames.OnViewConversationRequested, this.onViewConversationRequested);
    this.eventBus.off(MenuEventBusEventNames.OnOpenInboxRequested, this.onOpenInboxRequested);
  },
  methods: {
    onMenuRequested (menuState) {
      // TODO: For some reason, using the state to drive
      // the menus doesn't work correctly so instead we use the data() function
      // above to store the menu state in the component.
      menuState.state = menuState.state || null
      menuState.args = menuState.args || null

      // Toggle menu if its already open.
      if (menuState.state === this.menuState && menuState.args === this.menuArguments) {
        this.menuArguments = null
        this.menuState = null
      } else {
        this.menuArguments = menuState.args
        this.menuState = menuState.state
      }
    },
    changeMenuState (state, args) {
      this.$store.commit('setMenuState', {
        state,
        args
      })
    },
    onCloseRequested (e) {
      this.changeMenuState(null, null)
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
    onOpenTradeRequested (e) {
      this.changeMenuState(MENU_STATES.TRADE, e)
    },
    onEditWaypointsRequested (e) {
      this.changeMenuState(MENU_STATES.CARRIER_WAYPOINTS, e)
    },
    onEditWaypointRequested (e) {
      this.changeMenuState(MENU_STATES.CARRIER_WAYPOINT_DETAIL, e)
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
    onViewCarrierCombatCalculatorRequested (e) {
      this.changeMenuState(MENU_STATES.COMBAT_CALCULATOR, e)
    },
    onViewSettingsRequested (e) {
      this.changeMenuState(MENU_STATES.SETTINGS, e)
    },
    onOpenInboxRequested (e) {
      if (!this.canHandleConversationEvents()) return

      this.changeMenuState(MENU_STATES.INBOX, e)
    },
    onCreateNewConversationRequested (e) {
      if (!this.canHandleConversationEvents()) return

      this.changeMenuState(MENU_STATES.CREATE_CONVERSATION, e)
    },
    onViewConversationRequested (e) {
      if (!this.canHandleConversationEvents()) return

      if (e.conversationId) {
        this.changeMenuState(MENU_STATES.CONVERSATION, e.conversationId)
      } else if (e.participantIds) {
        this.changeMenuState(MENU_STATES.CREATE_CONVERSATION, e.participantIds)
      }
    },
    onOpenPurchasePlayerBadgeRequested (e) {
      this.changeMenuState(MENU_STATES.PLAYER_BADGE_SHOP, e)
    },
    onOpenReportPlayerRequested (e) {
      this.changeMenuState(MENU_STATES.REPORT_PLAYER, e)
    },
    onViewColourOverrideRequested (e) {
      this.$emit('onViewColourOverrideRequested', e)
    },
    canHandleConversationEvents () {
      return window.innerWidth < 992
    },
    onReloadGameRequested (e) {
      this.$emit('onReloadGameRequested', e)
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
  position:fixed;
  top: 0;
  height: 45px;
  z-index: 1;
}

.footer-bar {
  position: fixed;
  height: 52px;
  bottom: 0px;
  z-index: 1;
}

.menu {
  /* This is a must otherwise the div overlays the map */
  position:absolute;
  left: 50px;
  width: 473px;
  padding-top: 45px;
  max-height: 100%;
  overflow: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

.spacing-footer {
  height: 52px;
  pointer-events: none;
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

@media(max-width: 768px) {
    .menu {
        left: 0px;
    }
}
</style>
