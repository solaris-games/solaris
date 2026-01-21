<template>
<div>
  <p>
      You created the conversation <span class="text-success">{{event.data.name}}</span>.
  </p>
</div>
</template>

<script setup lang="ts">
import type {PlayerConversationCreatedEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerConversationCreatedEvent<string>,
}>();
</script>

<style scoped>
</style>
