<template>
<div class="table-responsive">
    <table class="table table-striped table-hover" v-if="leaderboard">
        <thead>
            <th>#</th>
            <th>Player</th>
            <th class="text-right">Rank</th>
            <th class="text-right">Victories</th>
            <th class="text-right">Renown</th>
        </thead>
        <tbody>
            <tr v-for="player in leaderboard" :key="player._id">
                <td>{{player.position}}</td>
                <td>
                    <router-link :to="{ name: 'account-achievements', params: { userId: player._id }}">{{player.username}}</router-link>
                    <i class="fas fa-hands-helping ml-1" title="This player is a contributor" v-if="player.contributor"></i>
                    <i class="fas fa-code ml-1" title="This player is a developer" v-if="player.developer"></i>
                </td>
                <td align="right">{{player.achievements.rank}}</td>
                <td align="right">{{player.achievements.victories}}</td>
                <td align="right">{{player.achievements.renown}}</td>
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
    leaderboard: Array
  }
}
</script>

<style scoped>
</style>
