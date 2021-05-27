<template>
  <sortable-leaderboard class="mt-2" :leaderboard="leaderboard" defaultSortingKey="rank">
    <template v-slot:header>
      <th>#</th>
      <th>Guild</th>
      <th class="text-right" title="Members"><i class="fas fa-user text-info"></i></th>
      <th class="text-right" title="Rank"><i class="fas fa-star text-info"></i></th>
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
  }
}
</script>

<style scoped>
</style>
