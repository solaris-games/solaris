<template>
  <div>
    <div class="row">
      <div class="col">
        <h4 class="mt-2">Trade History</h4>
      </div>
      <div class="col-auto">
        <button class="btn btn-sm btn-outline-success mt-2" @click="loadTradeEvents" :disabled="isLoading"><i
          class="fas fa-sync"></i> Refresh
        </button>
      </div>
    </div>

    <loading-spinner :loading="isLoading"/>

    <p v-if="!isLoading && !tradeEvents.length" class="text-center mb-0 pb-2">
      <small>You have not traded with this player.</small>
    </p>

    <div v-if="!isLoading && tradeEvents.length">
      <div class="row" v-for="event in tradeEvents" :key="event._id">
        <div class="col">
          <p v-if="event.type === 'playerRenownReceived'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
            <span>{{ event.data.renown }} <span class="text-warning">renown</span>.</span>
          </p>
          <p v-if="event.type === 'playerRenownSent'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-right text-danger': event.data.toPlayerId}"></i>
            <span>{{ event.data.renown }} <span class="text-warning">renown</span>.</span>
          </p>
          <p v-if="event.type === 'playerCreditsReceived'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
            <span>{{ event.data.credits }} <span class="text-warning">credits</span>.</span>
          </p>
          <p v-if="event.type === 'playerCreditsSent'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-right text-danger': event.data.toPlayerId}"></i>
            <span>{{ event.data.credits }} <span class="text-warning">credits</span>.</span>
          </p>
          <p v-if="event.type === 'playerCreditsSpecialistsReceived'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
            <span>{{ event.data.creditsSpecialists }} <span class="text-warning">specialist token(s)</span>.</span>
          </p>
          <p v-if="event.type === 'playerCreditsSpecialistsSent'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-right text-danger': event.data.toPlayerId}"></i>
            <span>{{ event.data.creditsSpecialists }} <span class="text-warning">specialist token(s)</span>.</span>
          </p>
          <p v-if="event.type === 'playerTechnologyReceived'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
            <span>Level {{ event.data.technology.level }} <span
              class="text-warning">{{ getTechnologyFriendlyName(event.data.technology.name as ResearchTypeNotRandom) }}</span></span>.
          </p>
          <p v-if="event.type === 'playerTechnologySent'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-right text-danger': event.data.toPlayerId}"></i>
            <span>Level {{ event.data.technology.level }} <span
              class="text-warning">{{ getTechnologyFriendlyName(event.data.technology.name as ResearchTypeNotRandom) }}</span></span>.
          </p>
          <p v-if="event.type === 'playerGiftReceived'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-left text-success': event.data.fromPlayerId}"></i>
            <span>{{ event.data.carrierShips }} <span class="text-warning">ships</span>.</span>
          </p>
          <p v-if="event.type === 'playerGiftSent'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-right text-danger': event.data.toPlayerId}"></i>
            <span>{{ event.data.carrierShips }} <span class="text-warning">ships</span>.</span>
          </p>
          <p v-if="event.type === 'playerDebtSettled'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-right text-danger': !isUserPlayerLedgerEventCreditor(event), 'fa-arrow-left text-success': isUserPlayerLedgerEventCreditor(event)}"></i>
            <span>{{ event.data.amount }} <span class="text-warning">{{ getCreditsType(event) }}</span> of debt <span
              class="text-warning">settled</span>.</span>
          </p>
          <p v-if="event.type === 'playerDebtForgiven'" class="mb-1">
            <i class="me-1 fas"
               :class="{'fa-arrow-left text-success': !isUserPlayerLedgerEventCreditor(event), 'fa-arrow-right text-danger': isUserPlayerLedgerEventCreditor(event)}"></i>
            <span>{{ event.data.amount }} <span class="text-warning">{{ getCreditsType(event) }}</span> of debt <span class="text-warning">forgiven</span>.</span>
          </p>
        </div>
        <div class="col-auto">
          <p class="mt-0 mb-0">
            <small><em>{{ getDateString(event.sentDate) }}</em></small>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { ref, computed, inject, onMounted } from 'vue';
import GameHelper from '../../../../services/gameHelper';
import TechnologyHelper from '../../../../services/technologyHelper';
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import { compareAsc } from 'date-fns';
import type {Game} from "@/types/game";
import {type BasePlayerDebtEvent, type ResearchTypeNotRandom, type TradeEvent} from "@solaris/common";
import {listTradeEvents} from "@/services/typedapi/trade";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";

const props = defineProps<{
  toPlayerId: string,
}>();

const httpClient = inject(httpInjectionKey)!;

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const isLoading = ref(false);
const tradeEvents = ref<TradeEvent<string>[]>([]);

const isUserPlayerLedgerEventCreditor = (event: TradeEvent<string>) => {
  if (event.type !== 'playerDebtSettled' && event.type !== 'playerDebtForgiven') {
    return false;
  }

  const summary = GameHelper.getLedgerGameEventPlayerSummary(game.value, event);

  return summary.isCreditor
};

const getTechnologyFriendlyName = (key: ResearchTypeNotRandom) => TechnologyHelper.getFriendlyName(key);

const getDateString = (date: Date) => GameHelper.getDateString(date);

const getCreditsType = (event: BasePlayerDebtEvent<string>) => {
  if (event.data.ledgerType === 'credits') {
    return 'credits';
  } else if (event.data.ledgerType === 'creditsSpecialists') {
    return 'specialist tokens';
  }
};

const loadTradeEvents = async () => {
  isLoading.value = true;

  const response = await listTradeEvents(httpClient)(game.value._id, props.toPlayerId);
  if (isOk(response)) {
    tradeEvents.value = response.data.sort((a, b) => compareAsc(a.sentDate, b.sentDate));
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

onMounted(async () => {
  await loadTradeEvents();
});
</script>

<style scoped>
</style>
