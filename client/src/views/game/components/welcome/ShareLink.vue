<template>
<div class="text-center pb-2">
    <p>{{message}}</p>

    <p class="mb-0">Send them this address:</p>
    <p class="text-info" @click="copyToClipboard"><i class="fas fa-copy"></i> {{fullRoute}}</p>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import { toastInjectionKey } from '@/util/keys';

defineProps<{
    message?: string;
}>();

const route = useRoute();
const toast = inject(toastInjectionKey)!;

const fullRoute = ref('');

onMounted(() => {
    const protocol = window.location.protocol;
    const domain = window.location.host;
    fullRoute.value = `${protocol}//${domain}/#${route.fullPath}`;
});

const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fullRoute.value);
    toast.default(`Copied to clipboard.`, { type: 'success' });
};
</script>

<style scoped>
</style>
