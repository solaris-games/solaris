<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{event.data.alias}}</a> has been kicked for inactivity.
  </p>
</div>
</template>

<script setup lang="ts">
import type {GamePlayerAfkEvent} from "@solaris-common";

const props = defineProps<{
  event: GamePlayerAfkEvent<string>,
}>();

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const onOpenPlayerDetailRequested = () => emit('onOpenPlayerDetailRequested', props.event.data.playerId);
</script>

<style scoped>
</style>
