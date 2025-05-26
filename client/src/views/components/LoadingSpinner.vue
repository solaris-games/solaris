<template>
<div class="pt-2 pb-2 text-center" v-if="props.loading">
    <h6>
      <div class="spinner-border"></div>
    </h6>
    <p class="mb-1" v-if="!props.hideText">{{props.text || 'Loading...'}}</p>
</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading: boolean;
  text?: string;
  hideText?: boolean;
}>();
</script>

<style scoped>
</style>
