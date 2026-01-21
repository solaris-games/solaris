<template>
<div>
  <p>
      You hired the specialist <span class="text-warning">{{event.data.specialistName}}</span> at the star <star-label :starId="event.data.starId" :starName="event.data.starName"/>.
  </p>
  <p>
    <small><em>{{event.data.specialistDescription}}</em></small>
  </p>
</div>
</template>

<script setup lang="ts">
import StarLabel from '../../star/StarLabel.vue'
import type {PlayerStarSpecialistHiredEvent} from "@solaris-common";

const props = defineProps<{
  event: PlayerStarSpecialistHiredEvent<string>,
}>()
</script>

<style scoped>
</style>
