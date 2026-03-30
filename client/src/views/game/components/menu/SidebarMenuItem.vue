<template>
  <a @click="setMenuState()"
    :title="tooltip"
    :class="{'active':isActive}">
      <i :class="iconClass"></i>
  </a>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { computed, inject } from 'vue';
import { eventBusInjectionKey } from '@/eventBus';

const props = defineProps<{
    menuState?: string;
    tooltip?: string;
    iconClass?: string;
}>();

const store = useGameStore();
const eventBus = inject(eventBusInjectionKey)!;

const isActive = computed(() => {
    return props.menuState === store.menuState;
});

const setMenuState = () => {
    store.setMenuState(eventBus, {
        state: props.menuState!,
        args: null
    });
};
</script>

<style scoped>
a {
  display: block;
  text-align: center;
  font-size: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 12px;
  padding-right: 12px;
  cursor: pointer;
  color: white !important;
}

a:hover {
  color: #375a7f !important;
}

a.active {
  background-color: #375a7f;
}

a.active:hover {
  color: white !important;
}
</style>
