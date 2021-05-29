<template>
<div class="table-responsive">
  <sortable-leaderboard v-if="leaderboard && !isLoading" class="mt-2" :leaderboard="leaderboard" :sortingKey="sortingKey" @sortingRequested="sortLeaderboard">
    <template v-slot:header="actions">
      <th style="width: 5%">#</th>
      <th style="width: 30%">Player</th>
      <th style="width: 30%" class="d-none d-md-table-cell">Guild</th>
      <th style="width: 10%" class="text-right sortable-header col" :class="actions.getColumnClass('rank')" title="Rank" @click="actions.sort('rank')">
        <i class="fas fa-star text-info"></i>
        <i v-if="actions.isActive('rank')" class="fas fa-chevron-down ml-2"></i>
      </th>
      <th style="width: 10%" class="text-right sortable-header col" :class="actions.getColumnClass('victories')" title="Victories" @click="actions.sort('victories')">
        <i class="fas fa-trophy text-warning"></i>
        <i v-if="actions.isActive('victories')" class="fas fa-chevron-down ml-2"></i>
      </th>
      <th style="width: 10%" class="text-right sortable-header col" :class="actions.getColumnClass('renown')" title="Renown" @click="actions.sort('renown')">
        <i class="fas fa-heart text-danger"></i>
        <i v-if="actions.isActive('renown')" class="fas fa-chevron-down ml-2"></i>
      </th>
    </template>
    <template v-slot:row="{ value: player, getColumnClass }">
      <td>{{player.position}}</td>
      <td>
          <router-link :to="{ name: 'account-achievements', params: { userId: player._id }}">
              <span>{{player.username}}</span>
              <span v-if="player.guild" class="d-md-none" :title="player.guild.name">[{{player.guild.tag}}]</span>
          </router-link>
          <i class="fas fa-hands-helping ml-1" title="This player is a contributor" v-if="player.roles && player.roles.contributor"></i>
          <i class="fas fa-code ml-1" title="This player is a developer" v-if="player.roles && player.roles.developer"></i>
          <i class="fas fa-user-friends ml-1" title="This player is a community manager" v-if="player.roles && player.roles.communityManager"></i>
      </td>
      <td class="d-none d-md-table-cell">
          {{player.guild ? player.guild.name + ' [' + player.guild.tag + ']' : ''}}
      </td>
      <td align="right" :class="getColumnClass('rank')">{{player.achievements.rank}}</td>
      <td align="right" :class="getColumnClass('victories')">{{player.achievements.victories}}</td>
      <td align="right" :class="getColumnClass('renown')">{{player.achievements.renown}}</td>
    </template>
  </sortable-leaderboard>
</div>
</template>

<script>
import SortableLeaderboard from './SortableLeaderboard';

export default {
  components: {
    'sortable-leaderboard': SortableLeaderboard
  },
  props: {
    leaderboard: Array,
    sortingKey: String
  },
  data () {
    return {
      isLoading: false
    }
  },
  methods: {
    sortLeaderboard(sortingKey) {
      this.$emit('sortingRequested', sortingKey)
    },
    getColumnClass(sortingKey) {
      return { 'table-primary': this.sortingKey === sortingKey }
    }
  }
}
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
