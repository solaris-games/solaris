<template>
  <div class="stacked">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.stacked {
  max-height: 100%;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 1fr;
  grid-template-areas: "stacked-content";
}
</style>
