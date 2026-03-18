<template>
  <div v-if="displayPoll" class="alert alert-success fade show poll">
    <span>Please participate in the 2024 <a class="alert-link" target="_blank" href="https://docs.google.com/forms/d/1HjfAphQ9EG8rRla_ipTIJAudbGZEoOwinCdqTkHcYb8">Solaris Community Poll!</a></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const displayPoll = computed(() => {
    const now = new Date();
    const endsAt = new Date('2024-05-15T00:00:00Z');

    return now < endsAt;
})
</script>

<style scoped>
.poll {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
