<template>
<span v-if="user && user.achievements" title="ELO Rating"><i class="fas fa-chess-knight me-1"></i>{{user.achievements.eloRating || 1200}}</span>
</template>

<script setup lang="ts">
import type { UserPublic } from '@solaris-common';

const props = defineProps<{
  user: UserPublic<string>,
}>();
</script>

<style scoped>
</style>
