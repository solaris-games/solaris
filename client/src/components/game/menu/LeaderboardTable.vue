<template>
<div class="table-responsive">
    <table class="table table-striped table-hover" v-if="leaderboard">
        <thead>
            <th>#</th>
            <th>Player</th>
            <th class="text-right" title="Rank"><i class="fas fa-star text-info"></i></th>
            <th class="text-right" title="Victories"><i class="fas fa-trophy text-warning"></i></th>
            <th class="text-right" title="Renown"><i class="fas fa-heart text-danger"></i></th>
        </thead>
        <tbody>
            <tr v-for="player in leaderboard" :key="player._id">
                <td>{{player.position}}</td>
                <td>
                    <router-link :to="{ name: 'account-achievements', params: { userId: player._id }}">{{player.username}}</router-link>
                    <i class="fas fa-hands-helping ml-1" title="This player is a contributor" v-if="player.roles && player.roles.contributor"></i>
                    <i class="fas fa-code ml-1" title="This player is a developer" v-if="player.roles && player.roles.developer"></i>
                    <i class="fas fa-user-friends ml-1" title="This player is a community manager" v-if="player.roles && player.roles.communityManager"></i>
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
