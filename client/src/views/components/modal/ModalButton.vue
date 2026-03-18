<template>
    <button type="button" :class="classText" data-bs-toggle="modal" :data-bs-target="'#' + modalName">
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
defineProps<{
    modalName: string;
    classText: string;
}>();
</script>

<style scoped>

</style>
