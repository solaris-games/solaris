<template>
<div>
    <loading-spinner :loading="isLoading"/>

    <div v-if="!isLoading" class="row">
      <div class="table-responsive p-0" v-if="ledgers.length">
        <table class="table table-sm table-striped mb-0">
          <tbody>
            <ledger-row
              v-for="ledger in ledgers"
              :key="ledger.playerId"
              :ledger="ledger"
              :ledgerType="ledgerType"
              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
          </tbody>
        </table>
      </div>

      <p v-if="!ledgers.length" class="col text-warning">You have not traded with any other player and have no debts or credits.</p>
    </div>
</div>
</template>

<script setup lang="ts">
import LoadingSpinner from '../../../components/LoadingSpinner.vue';
import LedgerRow from './LedgerRow.vue';
import { inject, ref, computed, onMounted, onUnmounted } from 'vue';
import { eventBusInjectionKey } from '@/eventBus';
import PlayerEventBusEventNames from '../../../../eventBusEventNames/player';
import {LedgerType, type PlayerLedgerDebt} from "@solaris-common";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {detailLedgerCredits, detailLedgerSpecialistTokens} from "@/services/typedapi/ledger";
import type {Game} from "@/types/game";
import { useGameStore } from "@/stores/game";

const props = defineProps<{
  ledgerType: LedgerType,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;
const httpClient = inject(httpInjectionKey)!;

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const isLoading = ref(false);
const ledgers = ref<PlayerLedgerDebt<string>[]>([]);

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const loadLedger = async () => {
  isLoading.value = true;

  const response = props.ledgerType === 'credits' ?
    await detailLedgerCredits(httpClient)(game.value._id) :
    await detailLedgerSpecialistTokens(httpClient)(game.value._id);

  if (isOk(response)) {
    ledgers.value = response.data;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const onUpdate = (e: { ledgerType: LedgerType }) => {
  if (e.ledgerType === props.ledgerType) {
    loadLedger();
  }
};

onMounted(() => {
  loadLedger();
  eventBus.on(PlayerEventBusEventNames.PlayerDebtAdded, onUpdate);
  eventBus.on(PlayerEventBusEventNames.PlayerDebtForgiven, onUpdate);
  eventBus.on(PlayerEventBusEventNames.PlayerDebtSettled, onUpdate);

  onUnmounted(() => {
    eventBus.off(PlayerEventBusEventNames.PlayerDebtAdded, onUpdate);
    eventBus.off(PlayerEventBusEventNames.PlayerDebtForgiven, onUpdate);
    eventBus.off(PlayerEventBusEventNames.PlayerDebtSettled, onUpdate);
  });
});
</script>

<style scoped>
table tr {
  height: 59px;
}

.table-sm td {
  padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}

@media screen and (max-width: 576px) {
  table tr {
    height: 45px;
  }
}
</style>
