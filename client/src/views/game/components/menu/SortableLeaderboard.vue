<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover leaderboard-table" v-if="leaderboard">
      <thead class="table-dark">
        <slot name="header" v-bind:sort="sortBy" v-bind:getColumnClass="getColumnClass" v-bind:isActive="isActiveSorting"></slot>
      </thead>
      <tbody>
        <slot v-for="value in leaderboard" name="row" v-bind="{ value, getColumnClass }"></slot>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts" generic="K extends string, T">
const props = defineProps<{
  sortingKey: K,
  leaderboard: T[]
}>();

const slots = defineSlots<{
  header(props: { getColumnClass: (k: K) => Record<string, boolean>, sort: (k: K) => void, isActive: (k: K) => boolean }): any,
  row(props: { value: T, getColumnClass: (k: K) => Record<string, boolean> }): any
}>();

const emit = defineEmits<{
  sortingRequested: [key: K],
}>();

const getColumnClass = (colKey: K) => {
  return { 'table-primary': props.sortingKey === colKey };
};

const isActiveSorting = (colKey: K) => {
  return props.sortingKey === colKey;
};

const sortBy = (key: K) => emit('sortingRequested', key);
</script>

<!-- This is deliberately not scoped, scoping is done by using the .leaderboard-table selector. Scoping would break the styling for nested components. -->
<style>
.leaderboard-table th {
  border-radius: 8px 8px 0 0;
}
.leaderboard-table tr:last-of-type td {
  border-radius: 0 0 8px 8px;
}
.leaderboard-table .sortable-header {
  cursor: pointer;
}
</style>
