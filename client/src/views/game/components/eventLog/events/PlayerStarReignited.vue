<template>
<div>
  <p>
      You have reignited the star <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
  </p>
</div>
</template>

<script setup lang="ts">
import StarLabel from '../../star/StarLabel.vue'
import type {PlayerStarReignitedEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerStarReignitedEvent<string>,
}>();
</script>

<style scoped>
</style>
