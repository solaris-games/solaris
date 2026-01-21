<template>
<div>
  <p>
      You were invited to the conversation <span class="text-success">{{event.data.name}}</span>.
  </p>
</div>
</template>

<script setup lang="ts">
import type {PlayerConversationInvitedEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerConversationInvitedEvent<string>,
}>();
</script>

<style scoped>
</style>
