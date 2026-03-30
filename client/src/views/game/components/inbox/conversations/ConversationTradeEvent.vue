<template>
<div class="container bg-dark mb-1"
    v-if="event"
    :class="{'left-message': !isFromUserPlayer, 'right-message': isFromUserPlayer}">
    <div class="row mt-0" :style="{'background-color': fromPlayerColour }" style="height:6px;"></div>
    <div class="row mt-0 ">
      <div class="col"></div>
      <div class="col-auto">
        <p class="mt-0 mb-0">
          <small><em>{{dateText}}</em></small>
        </p>
      </div>
    </div>
    <div class="row mt-0 ">
      <div class="col mt-1">
        <p v-if="'renown' in event.data && event.data.renown" class="mb-1">
            <em>Sent <span class="text-warning">{{event.data.renown}}</span> renown.</em>
        </p>
        <p v-if="'credits' in event.data && event.data.credits" class="mb-1">
            <em>Sent <span class="text-warning">{{event.data.credits}}</span> credits.</em>
        </p>
        <p v-if="'creditsSpecialists' in event.data &&event.data.creditsSpecialists" class="mb-1">
            <em>Sent <span class="text-warning">{{event.data.creditsSpecialists}}</span> specialist token(s).</em>
        </p>
        <p v-if="'technology' in event.data &&event.data.technology" class="mb-1">
            <em>Sent <span class="text-warning">Level {{event.data.technology.level}} {{getTechnologyFriendlyName(event.data.technology.name as ResearchTypeNotRandom)}}</span>.</em>
        </p>
        <p v-if="'carrierShips' in event.data &&event.data.carrierShips" class="mb-1">
            <em>Sent <span class="text-warning">{{event.data.carrierShips}} ships</span>.</em>
        </p>
        <p v-if="event.type === 'playerDebtSettled' && 'amount' in event.data" class="mb-1">
          <em>Paid off <span class="text-warning">{{getFormattedDebtValue(Boolean(event.data.amount))}}</span> of debt.</em>
        </p>
        <p v-if="event.type === 'playerDebtForgiven' && 'amount' in event.data" class="mb-1">
          <em>Forgave <span class="text-warning">{{getFormattedDebtValue(Boolean(event.data.amount))}}</span> of debt.</em>
        </p>
        <p v-if="event.type === 'playerDiplomacyStatusChanged'" class="mb-1">
          <em><strong>Diplomatic status changed</strong>:</em>
          <br/><br/>
          <em>{{event.data.playerToAlias}}: <span :class="{
            'text-success':event.data.statusFrom==='allies',
            'text-info':event.data.statusFrom==='neutral',
            'text-danger':event.data.statusFrom==='enemies'}">{{event.data.statusFrom}}</span></em>
          <br/>
          <em>{{event.data.playerFromAlias}}: <span :class="{
            'text-success':event.data.statusTo==='allies',
            'text-info':event.data.statusTo==='neutral',
            'text-danger':event.data.statusTo==='enemies'}">{{event.data.statusTo}}</span></em>
          <br/><br/>
          <em>Actual status: <span :class="{
            'text-success':event.data.actualStatus==='allies',
            'text-info':event.data.actualStatus==='neutral',
            'text-danger':event.data.actualStatus==='enemies'}">{{event.data.actualStatus}}</span></em>
        </p>
      </div>
    </div>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../../services/gameHelper'
import TechnologyHelper from '../../../../../services/technologyHelper'
import type {Game} from "@/types/game";
import {
  type BaseTradeEventTypes,
  type DiplomacyEvent,
  type ResearchTypeNotRandom,
  TRADE_EVENT_TYPES,
  type TradeEvent
} from "@solaris-common";
import { useColourStore } from '@/stores/colour';

const props = defineProps<{
  event: TradeEvent<string> | DiplomacyEvent<string>,
}>();

const store = useStore();
const colourStore = useColourStore();
const game = computed<Game>(() => store.state.game);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));

const getTechnologyFriendlyName = (key: ResearchTypeNotRandom) => TechnologyHelper.getFriendlyName(key);

const isTradeEvent = (ev: TradeEvent<string> | DiplomacyEvent<string>): ev is TradeEvent<string> => {
  return TRADE_EVENT_TYPES.includes(ev.type as BaseTradeEventTypes);
};

const isDiplomacyEvent = (ev: TradeEvent<string> | DiplomacyEvent<string>): ev is DiplomacyEvent<string> => {
  return !isTradeEvent(ev);
};

const getFromPlayer = () => {
  if (isDiplomacyEvent(props.event)) {
    if (props.event.type === 'playerDiplomacyStatusChanged') {
      return GameHelper.getPlayerById(game.value, props.event.data.playerIdFrom);
    }
  } else {
    switch (props.event.type) {
      case 'playerCreditsReceived':
      case 'playerCreditsSpecialistsReceived':
      case 'playerRenownReceived':
      case 'playerTechnologyReceived':
      case 'playerGiftReceived':
        return GameHelper.getPlayerById(game.value, props.event.data.fromPlayerId);
      case 'playerCreditsSent':
      case 'playerCreditsSpecialistsSent':
      case 'playerRenownSent':
      case 'playerTechnologySent':
      case 'playerGiftSent':
        return GameHelper.getPlayerById(game.value, props.event.playerId);
      case 'playerDebtSettled':
        return GameHelper.getPlayerById(game.value, props.event.data.debtorPlayerId);
      case 'playerDebtForgiven':
        return GameHelper.getPlayerById(game.value, props.event.data.creditorPlayerId);
    }
  }
};

const getFormattedDebtValue = (withText = false) => {
  if ("ledgerType" in props.event.data) {
    if (props.event.data.ledgerType === 'credits') {
      return `$${props.event.data.amount} credits`;
    }

    return `${props.event.data.amount} specialist token(s)`;
  }

  return undefined;
};

const fromPlayerColour = computed(() => {
  const fromPlayer = getFromPlayer();
  if (!fromPlayer) return 'white';
  return colourStore.getColourForPlayer(game.value, fromPlayer._id)!.value;
});

const dateText = computed(() => {
  const date = GameHelper.getDateString(props.event.sentDate);
  let tick = '';

  if ("sentTick" in props.event && (props.event.sentTick || props.event.sentTick === 0)) {
    tick = ` (tick ${props.event.sentTick})`;
  }

  return date + tick;
});

const isFromUserPlayer = computed(() => {
  const fromPlayer = getFromPlayer();
  if (!fromPlayer) return false;
  return fromPlayer._id === userPlayer.value?._id;
});
</script>

<style scoped>
.left-message {
  width: 85%;
  margin-left:0;
}

.right-message {
  width: 85%;
  margin-right:0;
}
</style>
