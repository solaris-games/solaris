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
<script>
export default {
  components: {},
  props: {
    sortingKey: String,
    leaderboard: Array,
  },
  methods: {
    sortBy (key) {
      this.$emit('sortingRequested', key)
    },
    getColumnClass (colKey) {
      return { 'table-primary': this.sortingKey === colKey }
    },
    isActiveSorting (colKey) {
      return this.sortingKey === colKey;
    }
  }
};
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