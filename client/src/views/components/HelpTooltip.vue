<template>
  <span class="label label-default" v-tooltip:bottom="tooltip">
    <i class="fas fa-question-circle"></i>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  tooltip: string,
}>();
</script>

<style scoped>
</style>
