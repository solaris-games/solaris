<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{event.data.alias}}</a> has left the game.
  </p>
</div>
</template>

<script setup lang="ts">
import type {GamePlayerQuitEvent} from "@solaris-common";

const props = defineProps<{
  event: GamePlayerQuitEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.playerId);
</script>

<style scoped>
</style>
