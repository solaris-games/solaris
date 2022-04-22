<template>
  <div class="row">
    <div class="col bg-secondary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">{{player.stats.totalEconomy}}</span>
    </div>
    <div class="col bg-primary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">{{player.stats.totalIndustry}}</span>
    </div>
    <div class="col bg-secondary pt-2 pb-2">
        <span>Yours</span>
        <span class="float-right">{{player.stats.totalScience}}</span>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  computed: {
    player () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
