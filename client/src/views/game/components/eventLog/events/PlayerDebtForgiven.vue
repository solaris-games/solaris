<template>
<div v-if="summary.debtor && summary.creditor">
  <p v-if="summary.isCreditor">
      You have forgiven <span class="text-warning">{{getFormattedDebtValue()}}</span> of debt owed to you by
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(summary.debtor)">{{summary.debtor.alias}}</a>.
  </p>
  <p v-else>
    <a href="javascript:;" @click="onOpenPlayerDetailRequested(summary.creditor)">{{summary.creditor.alias}}</a> has forgiven
    <span class="text-warning">{{getFormattedDebtValue()}}</span> of debt you owed to them.
  </p>
</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import GameHelper from '../../../../../services/gameHelper';
import type {PlayerDebtForgivenEvent} from "@solaris-common";
import type {Game, Player} from "@/types/game";

const props = defineProps<{
  event: PlayerDebtForgivenEvent<string>,
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
