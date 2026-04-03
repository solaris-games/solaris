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
import {useSocketStore} from "@/stores/socket.ts";

const socketStore = useSocketStore();

const connectedToServer = computed(() => socketStore.socketConnected);
</script>

<style scoped>
</style>
