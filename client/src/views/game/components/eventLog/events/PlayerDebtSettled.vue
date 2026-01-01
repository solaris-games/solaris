<template>
<div v-if="summary.debtor && summary.creditor">
  <p v-if="summary.isCreditor">
    <a href="javascript:;" @click="onOpenPlayerDetailRequested(summary.debtor)">{{summary.debtor.alias}}</a> has paid off
    <span class="text-warning">{{getFormattedDebtValue()}}</span> of debt owed to you.
  </p>
  <p v-else>
      You have paid off <span class="text-warning">{{getFormattedDebtValue()}}</span> of debt owed to
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(summary.creditor)">{{summary.creditor.alias}}</a>.
  </p>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../../services/gameHelper';
import type {PlayerDebtSettledEvent} from "@solaris-common";
import type {Game, Player} from "@/types/game";

const props = defineProps<{
  event: PlayerDebtSettledEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const store = useStore();
const game = computed<Game>(() => store.state.game);

const summary = computed(() => GameHelper.getLedgerGameEventPlayerSummary(game.value, props.event));

const onOpenPlayerDetailRequested = (player: Player) => emit('onOpenPlayerDetailRequested', player._id);

const getFormattedDebtValue = (withText = false) => {
  if (props.event.data.ledgerType === 'credits') {
    return `$${props.event.data.amount} credits`;
  }

  return `${props.event.data.amount} specialist token(s)`;
};
</script>

<style scoped>
</style>
