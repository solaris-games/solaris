<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdFrom)">{{event.data.playerFromAlias}}</a> has <span class="text-danger">declared war</span> on <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdTo)">{{event.data.playerToAlias}}</a>.
  </p>
</div>
</template>

<script setup lang="ts">
import type {GameDiplomacyWarDeclaredEvent} from "@solaris-common";

const props = defineProps<{
  event: GameDiplomacyWarDeclaredEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = (playerId: string) => emit('onOpenPlayerDetailRequested', playerId);
</script>

<style scoped>
</style>
