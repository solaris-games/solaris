<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover" v-if="leaderboard">
      <thead>
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

<style scoped>
th {
  border-radius: 8px 8px 0 0;
}
tr:last-of-type td {
  border-radius: 0 0 8px 8px;
}
.sortable-header {
  cursor: pointer;
}
</style>