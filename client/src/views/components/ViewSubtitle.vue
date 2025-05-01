<template>
<div class="row bg-dark mb-3">
  <div class="col">
  <h4 v-if="level === 'h4'" class="mt-3 mb-3">{{ title }}</h4>
  <h5 v-else-if="level === 'h5'" class="mt-3 mb-3">{{ title }}</h5>
  <h6 v-else-if="level === 'h6'" class="mt-3 mb-3">{{ title }}</h6>
  </div>
</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const { title, level = 'h4' } = defineProps<{
  title: string,
  level?: 'h4' | 'h5' | 'h6',
}>();

</script>
