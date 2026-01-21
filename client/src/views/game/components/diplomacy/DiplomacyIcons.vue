<template>
<span>
  <i :class="getStatusIcon(statusFrom)" :title="statusFrom"></i> (<i :class="getStatusIcon(actualStatus)" :title="actualStatus"></i>) <i :class="getStatusIcon(statusTo)" :title="statusTo"></i>
</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  statusFrom: string,
  statusTo: string,
  actualStatus: string,
}>();

const getStatusIcon = (status) => {
  switch (status) {
    case 'allies':
      return 'fas fa-handshake text-success'
    case 'neutral':
      return 'fas fa-dove text-info'
    case 'enemies':
      return 'fas fa-crosshairs text-danger'
  }
}
</script>

<style scoped>
</style>
