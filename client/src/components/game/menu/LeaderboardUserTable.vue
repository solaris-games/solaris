<template>
<div class="table-responsive">
    <table class="table table-striped table-hover" v-if="leaderboard">
        <thead>
            <th>#</th>
            <th>Player</th>
            <th class="d-none d-md-table-cell">Guild</th>
            <th class="text-right sortable-header" :class="getColumnClass('rank')" title="Rank" @click="sortLeaderboard('rank')"><i class="fas fa-star text-info"></i></th>
            <th class="text-right sortable-header" :class="getColumnClass('victories')" title="Victories" @click="sortLeaderboard('victories')"><i class="fas fa-trophy text-warning"></i></th>
            <th class="text-right sortable-header" :class="getColumnClass('renown')" title="Renown" @click="sortLeaderboard('renown')"><i class="fas fa-heart text-danger"></i></th>
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
                    <i class="fas fa-code ml-1" title="This player is a developer" v-if="player.roles && player.roles.developer"></i>
                    <i class="fas fa-user-friends ml-1" title="This player is a community manager" v-if="player.roles && player.roles.communityManager"></i>
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
