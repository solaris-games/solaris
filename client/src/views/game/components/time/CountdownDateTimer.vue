<template>
    <span>{{currentText}}</span>
</template>
<script setup lang="ts">
import GameHelper from '../../../../services/gameHelper';
import { ref, onMounted, onUnmounted } from 'vue';

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

  const current = Date.now()
  const delta = props.endDate.getTime() - current;

  if (delta < 0) {
    currentText.value = props.afterEndText || '';
  } else {
    currentText.value = GameHelper.getDateToString(delta);
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
