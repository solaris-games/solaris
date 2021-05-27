<template>
  <sortable-leaderboard class="mt-2" :leaderboard="leaderboard" defaultSortingKey="totalRank" @sortingRequested="sortLeaderboard">
    <template v-slot:header="actions">
      <th>#</th>
      <th>Guild</th>
      <th class="text-right" title="Members" @click="actions.sort('memberCount')"><i class="fas fa-user text-info"></i></th>
      <th class="text-right" title="Rank" @click="actions.sort('totalRank')"><i class="fas fa-star text-info"></i></th>
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
</template>

<script>
import SortableLeaderboard from './SortableLeaderboard'
export default {
  components: {
    'sortable-leaderboard': SortableLeaderboard
  },
  props: {
    leaderboard: Array
  },
  methods: {
    sortLeaderboard (key) {
      console.log("Sort: " + key);
    }
  }
}
</script>

<style scoped>
</style>
