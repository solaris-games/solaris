<template>
<div v-if="player && player.isOpenSlot" class="row bg-warning">
  <div class="col pt-1 pb-1 mt-0 mb-0">
    <p class="mb-0 mt-0">
      <small><i class="fas fa-user-clock"></i> This player slot is open.</small>
    </p>
  </div>
</div>
</template>

<script setup lang="ts">
import type {Player} from "@/types/game";

const props = defineProps<{
  player: Player,
}>();
</script>

<style scoped>
</style>
