<template>
<div>
  <header-bar class="header-bar"
    @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

  <sidebar-menu />

  <div class="menu">
    <not-logged-in-bar v-if="!userStore.isLoggedIn"/>

    <spectating-warning-bar/>

    <player-list @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>

    <div class="menu-content">
      <welcome v-if="menuState.state == 'welcome'" @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onViewSettingsRequested="onViewSettingsRequested"/>
      <tutorial v-if="menuState.state == 'tutorial'" @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      <leaderboard v-if="menuState.state == 'leaderboard'" @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onViewSettingsRequested="onViewSettingsRequested"/>
      <player v-if="menuState.state == 'player'" @onCloseRequested="onCloseRequested"
              :playerId="menuState.playerId" :key="menuState.playerId"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenTradeRequested="onOpenTradeRequested"
        @onOpenPurchasePlayerBadgeRequested="onOpenPurchasePlayerBadgeRequested"
        @onOpenReportPlayerRequested="onOpenReportPlayerRequested"
        @onViewColourOverrideRequested="onViewColourOverrideRequested"
      />
      <trade v-if="menuState.state == 'trade'"
        @onCloseRequested="onCloseRequested" :playerId="menuState.playerId" :key="menuState.playerId"
        @onOpenTradeRequested="onOpenTradeRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <research v-if="menuState.state == 'research'" @onCloseRequested="onCloseRequested"/>
      <star-detail v-if="menuState.state == 'starDetail'"
                   :starId="menuState.starId" :key="menuState.starId"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"
        @onViewHireStarSpecialistRequested="onViewHireStarSpecialistRequested"
        @onBuildCarrierRequested="onBuildCarrierRequested"
        @onShipTransferRequested="onShipTransferRequested"/>
      <carrier-detail v-if="menuState.state == 'carrierDetail'"
        @onCloseRequested="onCloseRequested" :carrierId="menuState.carrierId" :key="menuState.carrierId"
        @onShipTransferRequested="onShipTransferRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"
        @onEditWaypointRequested="onEditWaypointRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"
        @onViewCompareIntelRequested="onViewCompareIntelRequested"
        @onViewHireCarrierSpecialistRequested="onViewHireCarrierSpecialistRequested"
        @onCarrierRenameRequested="onCarrierRenameRequested"
        @onViewCarrierCombatCalculatorRequested="onViewCarrierCombatCalculatorRequested"/>
      <carrier-waypoints v-if="menuState.state == 'carrierWaypoints'"
        @onCloseRequested="onCloseRequested" :carrierId="menuState.carrierId"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onEditWaypointRequested="onEditWaypointRequested"/>
      <carrier-waypoint v-if="menuState.state == 'carrierWaypointDetail'"
        @onCloseRequested="onCloseRequested"
        :carrierId="menuState.carrierId"
        :waypoint="menuState.waypoint"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <carrier-rename v-if="menuState.state == 'carrierRename'"
        @onCloseRequested="onCloseRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        :carrierId="menuState.carrierId" />
      <combat-calculator v-if="menuState.state == 'combatCalculator'"
        :carrierId="menuState.carrierId"
        @onCloseRequested="onCloseRequested"/>
      <ship-transfer v-if="menuState.state == 'shipTransfer'"
        @onCloseRequested="onCloseRequested"
        :carrierId="menuState.carrierId"
        @onShipsTransferred="onShipsTransferred"
        @onEditWaypointsRequested="onEditWaypointsRequested"/>
      <build-carrier v-if="menuState.state == 'buildCarrier'"
        :starId="menuState.starId"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onEditWaypointsRequested="onEditWaypointsRequested"/>
      <event-log v-if="menuState.state == 'eventLog'"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <intel v-if="menuState.state == 'intel'" @onCloseRequested="onCloseRequested" :compareWithPlayerId="menuState?.compareWithPlayerId"/>
      <galaxy v-if="menuState.state == 'galaxy'"
        :tab="menuState.menu"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <bulk-infrastructure-upgrade v-if="menuState.state == 'bulkInfrastructureUpgrade'"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      <map-object-selector v-if="menuState.state == 'mapObjectSelector'"
        @onCloseRequested="onCloseRequested"
        :mapObjects="menuState.objects as ObjectClicked[]"
        @onEditWaypointsRequested="onEditWaypointsRequested"
        @onShipTransferRequested="onShipTransferRequested"
        @onBuildCarrierRequested="onBuildCarrierRequested"/>
      <ruler v-if="menuState.state == 'ruler'" @onCloseRequested="onCloseRequested"/>
      <ledger v-if="menuState.state == 'ledger'" @onCloseRequested="onCloseRequested" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <diplomacy v-if="menuState.state == 'diplomacy'" @onCloseRequested="onCloseRequested" @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <hire-specialist-carrier v-if="menuState.state == 'hireSpecialistCarrier'"
        :carrierId="menuState.carrierId"
        @onCloseRequested="onCloseRequested"
        @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
      <hire-specialist-star v-if="menuState.state == 'hireSpecialistStar'"
        :starId="menuState.starId"
        @onCloseRequested="onCloseRequested"
        @onOpenStarDetailRequested="onOpenStarDetailRequested"
        @onReloadGameRequested="onReloadGameRequested"/>
      <game-notes v-if="menuState.state == 'gameNotes'"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <options v-if="menuState.state == 'options'"
        @onCloseRequested="onCloseRequested"/>
      <settings v-if="menuState.state == 'settings'"
        @onCloseRequested="onCloseRequested"/>
      <player-badge-shop v-if="menuState.state == 'playerBadgeShop'"
        :recipientPlayerId="menuState.recipientPlayerId"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <report-player v-if="menuState.state == 'reportPlayer'"
        :args="menuState.args"
        @onCloseRequested="onCloseRequested"
        @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
      <spectators v-if="menuState.state == 'spectators'"
        @onCloseRequested="onCloseRequested"/>
      <game-statistics v-if="menuState.state == 'statistics'"
        @onCloseRequested="onCloseRequested" />
    </div>

    <div class="spacing-footer d-block d-sm-none"></div>
  </div>

  <footer-bar class="footer-bar d-xs-block d-sm-none"
    @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, inject, computed } from 'vue';
import PlayerList from './PlayerList.vue';
import Leaderboard from '../leaderboard/Leaderboard.vue';
import Player from '../player/Player.vue';
import Trade from '../player/Trade.vue';
import Welcome from '../welcome/Welcome.vue';
import Tutorial from '../tutorial/Tutorial.vue';
import Research from '../research/Research.vue';
import StarDetail from '../star/StarDetail.vue';
import CarrierDetail from '../carrier/CarrierDetail.vue';
import CarrierWaypoints from '../carrier/CarrierWaypoints.vue';
import CarrierWaypoint from '../carrier/CarrierWaypoint.vue';
import CarrierRename from '../carrier/CarrierRename.vue';
import ShipTransfer from '../carrier/ShipTransfer.vue';
import BuildCarrier from '../carrier/BuildCarrier.vue';
import Inbox from '../inbox/Inbox.vue';
import EventLog from '../eventLog/EventLog.vue';
import Intel from '../intel/Intel.vue';
import Galaxy from '../galaxy/Galaxy.vue';
import BulkInfrastructureUpgrade from '../star/BulkInfrastructureUpgrade.vue';
import MapObjectSelector from './MapObjectSelector.vue';
import CombatCalculator from '../carrier/CombatCalculator.vue';
import Ruler from '../ruler/Ruler.vue';
import HeaderBar from './HeaderBar.vue';
import SidebarMenu from './SidebarMenu.vue';
import Ledger from '../ledger/Ledger.vue';
import Diplomacy from '../diplomacy/Diplomacy.vue';
import HireSpecialistCarrier from '../specialist/HireSpecialistCarrier.vue';
import HireSpecialistStar from '../specialist/HireSpecialistStar.vue';
import GameNotes from '../notes/GameNotes.vue';
import Options from './Options.vue';
import Settings from '../settings/Settings.vue';
import ConversationCreate from '../inbox/conversations/ConversationCreate.vue';
import ConversationDetail from '../inbox/conversations/ConversationDetail.vue';
import FooterBar from './FooterBar.vue';
import NotLoggedInBar from './NotLoggedInBar.vue';
import SpectatingWarningBar from './SpectatingWarningBar.vue';
import PlayerBadgeShop from '../badges/PlayerBadgeShop.vue';
import ReportPlayer from '../report/ReportPlayer.vue';
import Spectators from '../spectators/Spectators.vue';
import { eventBusInjectionKey } from '@/eventBus';
import type { CarrierWaypoint as CWTp } from "@solaris/common";
import GameStatistics from "@/views/game/components/statistics/GameStatistics.vue";
import {useUserStore} from "@/stores/user";
import {useGameStore} from "@/stores/game";
import type {MenuState, ReportPlayerArgs} from "@/types/menu";
import type {ObjectClicked} from "@/eventBusEventNames/map";

const emit = defineEmits<{
  onViewColourOverrideRequested: [playerId: string],
  onReloadGameRequested: [],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const userStore = useUserStore();
const store = useGameStore();

const menuState = computed(() => store.menuState);

const changeMenuState = (newState: MenuState) => {
  store.setMenuState(newState);
};

const onCloseRequested = () => changeMenuState({ state: 'none' });

const onViewCompareIntelRequested = (e: string) => changeMenuState({ state: 'intel', compareWithPlayerId: e });

const onShipTransferRequested = (e: string) => changeMenuState({ state: 'shipTransfer', carrierId: e });

const onShipsTransferred = (e: string) => changeMenuState({ state: 'carrierDetail', carrierId: e });

const onOpenCarrierDetailRequested = (e: string) => changeMenuState({ state: 'carrierDetail', carrierId: e });

const onOpenStarDetailRequested = (e: string) => changeMenuState({ state: 'starDetail', starId: e });

const onOpenPlayerDetailRequested = (e: string) => changeMenuState({ state: 'player', playerId: e });

const onOpenTradeRequested = (e: string) => changeMenuState({ state: 'trade', playerId: e });

const onEditWaypointsRequested = (e: string) => changeMenuState({ state: 'carrierWaypoints', carrierId: e });

const onEditWaypointRequested = ({ carrierId, waypoint }: { carrierId: string, waypoint: CWTp<string> }) => changeMenuState({ state: 'carrierWaypointDetail', carrierId, waypoint });

const onViewHireCarrierSpecialistRequested = (e: string) => changeMenuState({ state: "hireSpecialistCarrier", carrierId: e });

const onViewHireStarSpecialistRequested = (e: string) => changeMenuState({ state: 'hireSpecialistStar', starId: e });

const onBuildCarrierRequested = (e: string) => changeMenuState({ state: 'buildCarrier', starId: e });

const onCarrierRenameRequested = (e: string) => changeMenuState({ state: 'carrierRename', carrierId: e });

const onViewCarrierCombatCalculatorRequested = (e: string | undefined) => changeMenuState({ state: 'combatCalculator', carrierId: e });

const onViewSettingsRequested = () => changeMenuState({ state: 'options' });

const onOpenPurchasePlayerBadgeRequested = (e: string) => changeMenuState({ state: "playerBadgeShop", recipientPlayerId: e });

const onOpenReportPlayerRequested = (args: ReportPlayerArgs) => changeMenuState({ state: 'reportPlayer', args });

const onViewColourOverrideRequested = (e: string) => emit('onViewColourOverrideRequested', e);

const onReloadGameRequested = () => emit('onReloadGameRequested');
</script>

<style scoped>
.header-bar {
  position:fixed;
  top: 0;
  height: 45px;
  z-index: 1000;
}

.footer-bar {
  position: fixed;
  height: 52px;
  bottom: 0px;
  z-index: 1000;
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
