<template>
  <div class="stacked">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.stacked {
  display: grid;
  grid-template-rows: 100%;
  grid-template-columns: 100%;
  grid-template-areas: "stacked-content";
}
</style>
