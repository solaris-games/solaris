<template>
<tr>
  <td :style="{'width': '8px', 'background-color': getFriendlyColour(ledger.playerId)}"></td>
  <td class="col-avatar" :title="getPlayerAlias(ledger.playerId)">
    <player-avatar @onClick="onOpenPlayerDetailRequested(ledger.playerId)" :player="getPlayer(ledger.playerId)"/>
  </td>
  <td class="ps-2 pt-3 pb-2">
    <h5 class="alias-title">{{getPlayerAlias(ledger.playerId)}}</h5>
  </td>
  <td class="fit pt-3 pe-4">
    <h5 :class="{'text-success':ledger.debt>0,'text-danger':ledger.debt<0}">{{getFormattedDebtValue()}}</h5>
  </td>
  <td class="fit pt-2 pb-2 pe-2">
    <button class="btn btn-danger" :class="{'btn-outline-danger':!canSettleDebt}" :disabled="!canSettleDebt" @click="settleDebt(ledger)" title="Settle your debt to this player"><i class="fas fa-money-check-alt"></i></button>
    <button class="btn btn-success ms-1" :class="{'btn-outline-success':!canForgiveDebt}" :disabled="!canForgiveDebt" @click="forgiveDebt(ledger)" title="Forgive this player's debt to you"><i class="fas fa-hands-helping"></i></button>
  </td>
</tr>
</template>

<script setup lang="ts">
import {ref, computed, inject} from 'vue';
import {useStore} from 'vuex';
import PlayerAvatar from '../menu/PlayerAvatar.vue';
import gameHelper from '../../../../services/gameHelper';
import type {LedgerType, PlayerLedgerDebt} from "@solaris-common";
import type { Game } from "@/types/game";
import {useConfirm} from "@/hooks/confirm.ts";
import {formatError, httpInjectionKey, isOk} from "@/services/typedapi";
import {toastInjectionKey} from "@/util/keys";
import {
  forgiveLedgerCredits,
  forgiveLedgerSpecialistTokens,
  settleLedgerCredits,
  settleLedgerSpecialistTokens
} from "@/services/typedapi/ledger";
import { useColourStore } from '@/stores/colour';

const props = defineProps<{
  ledger: PlayerLedgerDebt<string>,
  ledgerType: LedgerType,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const httpClient = inject(httpInjectionKey)!;
const toast = inject(toastInjectionKey)!;

const store = useStore();
const confirm = useConfirm();
const colourStore = useColourStore();
const game = computed<Game>(() => store.state.game);

const isLoading = ref(false);

const isGameFinished = computed(() => gameHelper.isGameFinished(game.value));

const canSettleDebt = computed(() => props.ledger.debt < 0 && !isLoading.value && (props.ledgerType === 'credits' ? gameHelper.getUserPlayer(game.value)!.credits : gameHelper.getUserPlayer(game.value)!.creditsSpecialists) > 0 && !isGameFinished.value);

const canForgiveDebt = computed(() => props.ledger.debt > 0 && !isGameFinished.value && !isLoading.value);

const getPlayer = (playerId: string) => gameHelper.getPlayerById(game.value, playerId)!;

const getPlayerAlias = (playerId: string) => getPlayer(playerId).alias;

const getFriendlyColour = (playerId: string) => colourStore.getColourForPlayer(game.value, playerId)!.value;

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);

const getFormattedDebtValue = (withText = false) => {
  if (props.ledgerType === 'credits') {
    return `$${props.ledger.debt}`
  }

  return `${props.ledger.debt}${withText ? ' specialist token(s)' : ''}`
}

const forgiveDebt = async (ledger: PlayerLedgerDebt<string>) => {
  const playerAlias = getPlayerAlias(ledger.playerId);

  if (!await confirm('Forgive debt', `Are you sure you want to forgive the debt of ${getFormattedDebtValue(true)} that ${playerAlias} owes you?`)) {
    return;
  }

  isLoading.value = true;

  const response = props.ledgerType === 'credits' ?
    await forgiveLedgerCredits(httpClient)(game.value._id, ledger.playerId) :
    await forgiveLedgerSpecialistTokens(httpClient)(game.value._id, ledger.playerId);

  if (isOk(response)) {
    toast.success(`The debt ${playerAlias} owes you has been forgiven.`);
    ledger.debt = response.data.ledger.debt;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};

const settleDebt = async (ledger: PlayerLedgerDebt<string>) => {
  const playerAlias = getPlayerAlias(ledger.playerId);

  if (!await confirm('Settle debt', `Are you sure you want to settle the debt of ${getFormattedDebtValue(true)} that you owe to ${playerAlias}?`)) {
    return;
  }

  isLoading.value = true;

  const isCredits = props.ledgerType === 'credits';

  const response = isCredits ?
    await settleLedgerCredits(httpClient)(game.value._id, ledger.playerId) :
    await settleLedgerSpecialistTokens(httpClient)(game.value._id, ledger.playerId);

  if (isOk(response)) {
    toast.success(`You have paid off ${(response.data.ledger.debt !== 0 ? 'some of the' : 'the')} debt that you owe${(response.data.ledger.debt !== 0 ? '' : 'd')} to ${playerAlias}.`);

    const debtPaidOff = Math.abs(ledger.debt) - Math.abs(response.data.ledger.debt);

    if (isCredits) {
      gameHelper.getUserPlayer(game.value)!.credits -= debtPaidOff;
    } else {
      gameHelper.getUserPlayer(game.value)!.creditsSpecialists -= debtPaidOff;
    }

    ledger.debt = response.data.ledger.debt;
  } else {
    console.error(formatError(response));
  }

  isLoading.value = false;
};
</script>

<style scoped>
.col-avatar {
  position:absolute;
  width: 59px;
  height: 59px;
  cursor: pointer;
  padding: 0;
}

.alias-title {
  padding-left: 59px;
}

tr {
  height: 59px;
}

td {
  padding: 0;
}

.table td.fit,
.table th.fit {
    white-space: nowrap;
    width: 1%;
}

@media screen and (max-width: 576px) {
  tr {
    height: 45px;
  }

  .alias-title {
    padding-left: 45px;
  }

  .col-avatar {
    width: 45px;
  }
}
</style>
