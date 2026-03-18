<template>
  <svg viewBox="0 0 512 512">
    <ellipse v-if="shape === 'circle'" :style="iconStyle" cx="256" cy="256" rx="224" ry="224" />
    <rect v-if="shape === 'square'" :style="iconStyle" width="448" height="448" />
    <polygon v-if="shape === 'diamond'" :style="iconStyle" points="256 32, 480 256, 256 480, 32 256" />
    <polygon v-if="shape === 'hexagon'" :style="iconStyle" points="128,32 0,256 128,480 384,480 512,256 384,32 " transform="matrix(0.87415039,0,0,0.87415039,32.2175,32.2175)" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  filled: boolean,
  iconColour: string,
  shape: string,
}>();

const iconStyle = computed(() => {
  if (props.filled) {
    return { 'fill': props.iconColour, 'stroke': 'none' }
  } else {
    return {'stroke-width':64, 'fill': 'none', 'stroke': props.iconColour}
  }
});
</script>

<style>

</style>
