<template>
<div class="cg-group-star" v-if="model">
  <p>Hello there! I am a star!</p>
  <button class="btn btn-sm btn-danger" @click="remove">
    X
  </button>
</div>
</template>
<script setup lang="ts">
import type {CombatBaseStar} from "@solaris/common";

const emit = defineEmits<{
  onRemove: [],
}>();

const model = defineModel<CombatBaseStar<string>>({ required: true });

const remove = () => emit('onRemove');
</script>
<style scoped>
.cg-group-star {
  display: flex;
}
</style>
