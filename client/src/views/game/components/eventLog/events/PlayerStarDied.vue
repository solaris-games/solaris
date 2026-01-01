<template>
<div>
  <p>
      The star <star-label :starId="event.data.starId" :starName="event.data.starName"/> has died and its infrastructure has been destroyed.
  </p>
</div>
</template>

<script setup lang="ts">
import StarLabel from '../../star/StarLabel.vue'
import type {PlayerStarDiedEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerStarDiedEvent<string>,
}>();
</script>

<style scoped>
</style>
