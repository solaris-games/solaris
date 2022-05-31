<template>
  <div class="row">
    <div class="col bg-secondary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">
          <i class="fas fa-chevron-up mr-1 text-success" v-if="comparePlayer.stats.totalEconomy < userPlayer.stats.totalEconomy"></i>
          <i class="fas fa-chevron-down mr-1 text-danger" v-if="comparePlayer.stats.totalEconomy > userPlayer.stats.totalEconomy"></i>
          <span>{{userPlayer.stats.totalEconomy}}</span>
        </span>
    </div>
    <div class="col bg-primary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">
          <i class="fas fa-chevron-up mr-1 text-success" v-if="comparePlayer.stats.totalIndustry < userPlayer.stats.totalIndustry"></i>
          <i class="fas fa-chevron-down mr-1 text-danger" v-if="comparePlayer.stats.totalIndustry > userPlayer.stats.totalIndustry"></i>
          <span>{{userPlayer.stats.totalIndustry}}</span>
        </span>
    </div>
    <div class="col bg-secondary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">
          <i class="fas fa-chevron-up mr-1 text-success" v-if="comparePlayer.stats.totalScience < userPlayer.stats.totalScience"></i>
          <i class="fas fa-chevron-down mr-1 text-danger" v-if="comparePlayer.stats.totalScience > userPlayer.stats.totalScience"></i>
          <span>{{userPlayer.stats.totalScience}}</span>
        </span>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  props: {
    comparePlayerId: String
  },
  computed: {
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    comparePlayer () {
      return GameHelper.getPlayerById(this.$store.state.game, this.comparePlayerId)
    }
  }
}
</script>

<style scoped>
</style>
