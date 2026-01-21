<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdFrom)">{{event.data.playerFromAlias}}</a> is now at <span class="text-info">peace</span> with <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdTo)">{{event.data.playerToAlias}}</a>.
  </p>
</div>
</template>

<script setup lang="ts">
import type {GameDiplomacyPeaceDeclaredEvent} from "@solaris-common";

const props = defineProps<{
  event: GameDiplomacyPeaceDeclaredEvent<string>,
}>();


const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);
</script>

<style scoped>
</style>
