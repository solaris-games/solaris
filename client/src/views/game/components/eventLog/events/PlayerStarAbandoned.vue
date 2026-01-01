<template>
<div>
  <p>
      You have abandoned the star <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
  </p>
</div>
</template>

<script setup lang="ts">
import StarLabel from '../../star/StarLabel.vue'
import type {PlayerStarAbandonedEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerStarAbandonedEvent<string>,
}>();
</script>

<style scoped>
</style>
