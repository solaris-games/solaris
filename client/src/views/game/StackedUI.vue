<template>
  <div class="stacked">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.stacked {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: auto;

  * {
    grid-column: 1;
    grid-row: 1;
  }
}
</style>
