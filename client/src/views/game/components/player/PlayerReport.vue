<template>
    <div class="pt-1 pb-2 row">
      <div class="col text-center">
        <small>
          <a class="text-danger" href="javascript:;" @click="onOpenReportPlayerRequested">Report this player</a>
        </small>
      </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  playerId: string,
}>();

const emit = defineEmits<{
  onOpenReportPlayerRequested: [],
}>();

const onOpenReportPlayerRequested = () => emit('onOpenReportPlayerRequested');
</script>

<style scoped>
</style>
