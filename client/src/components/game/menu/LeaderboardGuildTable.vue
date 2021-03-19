<template>
<div class="table-responsive">
    <table class="table table-striped table-hover" v-if="leaderboard">
        <thead>
            <th>#</th>
            <th>Guild</th>
            <th class="text-right" title="Rank"><i class="fas fa-star text-info"></i></th>
        </thead>
        <tbody>
            <tr v-for="guild in leaderboard" :key="guild._id">
                <td>{{guild.position}}</td>
                <td>
                    {{guild.name}} [{{guild.tag}}]
                </td>
                <td align="right">{{guild.totalRank}}</td>
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
