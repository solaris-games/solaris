<template>
  <div class="menu-page  pb-2">
    <div class="container">
      <menu-title title="Statistics" @onCloseRequested="onCloseRequested"></menu-title>

      <loading-spinner :loading="!statistics"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, type Ref } from 'vue';
import {httpInjectionKey} from "@/services/typedapi";
import type {Statistics} from "@solaris-common";
import LoadingSpinner from "@/views/components/LoadingSpinner.vue";
import MenuTitle from "@/views/game/components/MenuTitle.vue";

const httpClient = inject(httpInjectionKey)!;

const emit = defineEmits<{
  onCloseRequested: [];
}>();

const statistics: Ref<Statistics | null> = ref(null);

const onCloseRequested = () => {
  emit('onCloseRequested');
};
</script>

<style scoped>

</style>
