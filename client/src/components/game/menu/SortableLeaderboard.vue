<template>
  <div class="table-responsive">
    <table class="table table-striped table-hover" v-if="leaderboard">
      <thead>
        <slot name="header" v-bind:sort="sortBy" v-bind:getColumnClass="getColumnClass" v-bind:isActive="isActiveSorting"></slot>
      </thead>
      <tbody>
        <tr v-for="value in leaderboard" :key="value._id">
          <slot name="row" v-bind="value"></slot>
        </tr>
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
</style>