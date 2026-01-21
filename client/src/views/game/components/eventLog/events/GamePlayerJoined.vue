<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{event.data.alias}}</a> has joined the game.
  </p>
</div>
</template>

<script setup lang="ts">
import type {GamePlayerJoinedEvent} from "@solaris-common";

const props = defineProps<{
  event: GamePlayerJoinedEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.playerId);
</script>

<style scoped>
</style>
