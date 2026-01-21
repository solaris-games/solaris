<template>
<div>
  <p>
      The game has started. Good luck and have fun!
  </p>
</div>
</template>

<script setup lang="ts">
import type {GameStartedEvent} from "@solaris-common";

const props = defineProps<{
  event: GameStartedEvent<string>,
}>();
</script>

<style scoped>
</style>
