<template>
  <div class="menu-page container">
    <menu-title
      title="Select carrier"
      @onCloseRequested="onCloseRequested"
    ></menu-title>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import MenuTitle from "@/views/game/components/MenuTitle.vue";
import type { Carrier } from "@/types/game.ts";
import { useMapClickStore } from "@/stores/mapClick.ts";

const props = defineProps<{
  callback: (carrier: Carrier | undefined) => void;
}>();

const emit = defineEmits<{
  onCloseRequested: [];
}>();

const mapClickStore = useMapClickStore();

const onCarrierSelect = (carrier: Carrier) => {
  props.callback(carrier);
  emit("onCloseRequested");
};

const onCloseRequested = () => {
  props.callback(undefined);
  emit("onCloseRequested");
};

onMounted(() => {
  mapClickStore.setCarrierClickCallback(onCarrierSelect);
});

onUnmounted(() => {
  mapClickStore.setStarClickCallback(null);
});
</script>
<style scoped></style>
