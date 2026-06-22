<template>
  <div class="menu-page container">
    <menu-title title="Select star" @onCloseRequested="onCloseRequested"></menu-title>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import MenuTitle from "@/views/game/components/MenuTitle.vue";
import type {Star} from "@/types/game.ts";
import {useMapClickStore} from "@/stores/mapClick.ts";

const props = defineProps<{
  callback: (star: Star | undefined) => void;
}>();

const emit = defineEmits<{
  onCloseRequested: [];
}>();

const mapClickStore = useMapClickStore();

const onStarSelect = (star: Star) => {
  props.callback(star);
  emit("onCloseRequested");
};

const onCloseRequested = () => {
  props.callback(undefined);
  emit("onCloseRequested");
};

onMounted(() => {
  mapClickStore.setStarClickCallback(onStarSelect);
});

onUnmounted(() => {
  mapClickStore.setStarClickCallback(null);
})
</script>
<style scoped>

</style>
