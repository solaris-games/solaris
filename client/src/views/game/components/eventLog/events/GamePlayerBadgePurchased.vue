<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.purchasedByPlayerId)">{{event.data.purchasedByPlayerAlias}}</a> has awarded the <span class="text-warning">{{event.data.badgeName}}</span> badge to <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.purchasedForPlayerId)">{{event.data.purchasedForPlayerAlias}}</a>.
  </p>
</div>
</template>

<script setup lang="ts">
import type {GamePlayerBadgePurchasedEvent} from "@solaris-common";

const props = defineProps<{
  event: GamePlayerBadgePurchasedEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);
</script>

<style scoped>
</style>
