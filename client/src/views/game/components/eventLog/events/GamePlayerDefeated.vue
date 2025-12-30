<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{event.data.alias}}</a> has been defeated.
  </p>
  <p v-if="event.data.openSlot">
    <small>The player slot has been opened for another player to join the game.</small>
  </p>
</div>
</template>

<script setup lang="ts">
import type {GamePlayerDefeatedEvent} from "@solaris-common";

const props = defineProps<{
  event: GamePlayerDefeatedEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.playerId);
</script>

<style scoped>
</style>
