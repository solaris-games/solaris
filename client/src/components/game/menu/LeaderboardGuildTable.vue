<template>
  <div>
    <loading-spinner :loading="isLoading"/>

    <sortable-leaderboard class="mt-2" :leaderboard="leaderboard" :sortingKey="sortingKey" @sortingRequested="sortLeaderboard" v-if="!isLoading">
      <template v-slot:header="actions">
        <th>#</th>
        <th>Guild</th>
        <th class="text-right" title="Members" @click="actions.sort('memberCount')" :class="actions.getColumnClass('memberCount')">
          <i class="fas fa-user text-info"></i>
          <i v-if="actions.isActive('memberCount')" class="fas fa-chevron-down ml-2"></i>
        </th>
        <th class="text-right" title="Rank" @click="actions.sort('totalRank')" :class="actions.getColumnClass('totalRank')">
          <i class="fas fa-star text-info"></i>
          <i v-if="actions.isActive('totalRank')" class="fas fa-chevron-down ml-2"></i>
        </th>
      </template>
      <template v-slot:row="guild">
          <td>{{guild.position}}</td>
          <td>
              {{guild.name}} [{{guild.tag}}]
          </td>
          <td align="right">{{guild.memberCount}}</td>
          <td align="right">{{guild.totalRank}}</td>
      </template>
    </sortable-leaderboard>
  </div>
</template>

<script>
import LoadingSpinner from '../../LoadingSpinner';
import SortableLeaderboard from './SortableLeaderboard'

export default {
  components: {
    'loading-spinner': LoadingSpinner,
    'sortable-leaderboard': SortableLeaderboard
  },
  props: {
    leaderboard: Array
  },
  data () {
    return {
      isLoading: false,
      sortingKey: 'totalRank'
    }
  },
  methods: {
    sortLeaderboard (key) {
      this.isLoading = true;
      console.log("Sort: " + key);
      this.sortingKey = key;
      this.isLoading = false;
    }
  }
}
</script>

<style scoped>
</style>
