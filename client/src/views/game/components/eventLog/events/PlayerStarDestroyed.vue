<template>
  <div>
    <p>
      The star
      <star-label :starId="event.data.starId" :starName="event.data.starName" />
      has been destroyed.
    </p>
  </div>
</template>

<script setup lang="ts">
import StarLabel from "../../star/StarLabel.vue";
import type { PlayerStarDestroyedEvent } from "@solaris/common";

const props = defineProps<{
  event: PlayerStarDestroyedEvent<string>;
}>();
</script>

<style scoped></style>
