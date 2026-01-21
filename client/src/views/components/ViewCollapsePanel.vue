<template>
<div>
  <div class="row bg-dark mb-2">
    <div class="col">
      <h4 class="mt-3 mb-3">{{ title }}</h4>
    </div>
    <div class="col-auto" style="margin: auto">
      <button type="button" class="btn btn-sm btn-outline-primary" @click="toggle()">{{collapseText}}</button>
    </div>
  </div>
  <div v-if="!isCollapsed" class="mb-3">
    <slot></slot>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const props = defineProps<{
  title: string,
  startsOpened: boolean,
}>();

const emit = defineEmits<{
  onToggle: [v: boolean];
}>();

const isCollapsed = ref(true);

const collapseText = computed(() => isCollapsed.value ? 'expand' : 'collapse');

const toggle = () => {
  isCollapsed.value = !isCollapsed.value;
  emit('onToggle', isCollapsed.value);
};

onMounted(() => {
  isCollapsed.value = !props.startsOpened || false;
});
</script>

<style scoped>
</style>
