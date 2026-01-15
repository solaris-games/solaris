<template>
    <span>{{currentText}}</span>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import {between, formatDuration, toSeconds} from "@/util/duration";

const props = defineProps<{
  endDate?: Date,
  afterEndText?: string,
  active: boolean,
}>();

const currentText = ref('');

const recalculateTime = () => {
  if (!props.endDate || !props.active) {
    currentText.value = props.afterEndText || '';
    return;
  }

  const current = new Date();

  console.warn({
    current,
    endDate: props.endDate,
  })

  const delta = between(current, props.endDate);

  console.warn(delta);

  if (toSeconds(delta) <= 0)  {
    currentText.value = props.afterEndText || '';
  } else {
    currentText.value = formatDuration(delta);
  }
};

onMounted(() => {
  const intervalHandle = setInterval(recalculateTime, 250);
  recalculateTime();

  onUnmounted(() => {
    clearInterval(intervalHandle);
  });
});
</script>
<style>
</style>
