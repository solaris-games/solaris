<template>
<div>
  <p>
      You left the conversation <span class="text-success">{{event.data.name}}</span>.
  </p>
</div>
</template>

<script setup lang="ts">
import type {PlayerConversationLeftEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerConversationLeftEvent<string>,
}>();
</script>

<style scoped>
</style>
