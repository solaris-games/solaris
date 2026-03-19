<template>
<span :class="{
    'text-success':connectedToServer,
    'text-danger':!connectedToServer}"
    title="Server connection status">
    <i class="fas fa-circle"></i>
</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const connectedToServer = computed(() => store.state.socketConnected);
</script>

<style scoped>
</style>
