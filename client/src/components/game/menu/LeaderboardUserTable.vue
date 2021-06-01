<template>
<div class="table-responsive">
    <table class="table table-striped table-hover" v-if="leaderboard">
        <thead>
            <th style="width: 5%">#</th>
            <th style="width: 30%">Player</th>
            <th style="width: 30%" class="d-none d-md-table-cell">Guild</th>
            <th style="width: 10%" class="text-right sortable-header col" :class="getColumnClass('rank')" title="Rank" @click="sortLeaderboard('rank')">
              <i class="fas fa-star text-info"></i>
              <i v-if="activeSortingKey === 'rank'" class="fas fa-chevron-down ml-2"></i>
            </th>
            <th style="width: 10%" class="text-right sortable-header col" :class="getColumnClass('victories')" title="Victories" @click="sortLeaderboard('victories')">
              <i class="fas fa-trophy text-warning"></i>
              <i v-if="activeSortingKey === 'victories'" class="fas fa-chevron-down ml-2"></i>
            </th>
            <th style="width: 10%" class="text-right sortable-header col" :class="getColumnClass('renown')" title="Renown" @click="sortLeaderboard('renown')">
              <i class="fas fa-heart text-danger"></i>
              <i v-if="activeSortingKey === 'renown'" class="fas fa-chevron-down ml-2"></i>
            </th>
        </thead>
        <tbody>
            <tr v-for="player in leaderboard" :key="player._id">
                <td>{{player.position}}</td>
                <td>
                    <router-link :to="{ name: 'account-achievements', params: { userId: player._id }}">
                        <span>{{player.username}}</span>
                        <span v-if="player.guild" class="d-md-none" :title="player.guild.name">[{{player.guild.tag}}]</span>
                    </router-link>
                    <i class="fas fa-hands-helping ml-1" title="This player is a contributor" v-if="player.roles && player.roles.contributor"></i>
                    <i class="fas fa-code ml-1" title="This player is an active developer" v-if="player.roles && player.roles.developer"></i>
                    <i class="fas fa-user-friends ml-1" title="This player is an active community manager" v-if="player.roles && player.roles.communityManager"></i>
                </td>
                <td class="d-none d-md-table-cell">
                    {{player.guild ? player.guild.name + ' [' + player.guild.tag + ']' : ''}}
                </td>
                <td align="right" :class="getColumnClass('rank')">{{player.achievements.rank}}</td>
                <td align="right" :class="getColumnClass('victories')">{{player.achievements.victories}}</td>
                <td align="right" :class="getColumnClass('renown')">{{player.achievements.renown}}</td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script>
export default {
  components: {
  },
  props: {
    leaderboard: Array,
    activeSortingKey: String
  },
  methods: {
    sortLeaderboard(sortingKey) {
      this.$emit('sortingRequested', sortingKey)
    },
    getColumnClass(sortingKey) {
      return { 'table-primary': this.activeSortingKey === sortingKey }
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
