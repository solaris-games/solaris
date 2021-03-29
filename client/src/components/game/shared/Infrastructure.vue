<template>
  <div class="row">
    <div class="col text-center bg-primary pt-2 pb-1">
        <h6>Economy</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-money-bill-wave text-success mr-2"></i>{{ economy }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-money-bill-wave text-success mr-2"></i>{{ economy }}</h4>
    </div>
    <div class="col text-center bg-secondary pt-2 pb-1">
        <h6>Industry</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-tools text-warning mr-2"></i>{{ industry }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-tools text-warning mr-2"></i>{{ industry }}</h4>
    </div>
    <div class="col text-center bg-primary pt-2 pb-1">
        <h6>Science</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-flask text-info mr-2"></i>{{ science }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-flask text-info mr-2"></i>{{ science }}</h4>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    playerId: String,
    starId: String
  },
  computed: {
    isSmallHeaders () {
      return this.economy >= 100 || this.industry >= 100 || this.science >= 100
    },
    economy () {
      return this.player ? this.player.stats.totalEconomy : this.star.infrastructure.economy
    },
    industry () {
      return this.player ? this.player.stats.totalIndustry : this.star.infrastructure.industry
    },
    science () {
      return this.player ? this.player.stats.totalScience : this.star.infrastructure.science
    },
    player () {
      if (!this.playerId) {
        return null
      }

      return GameHelper.getPlayerById(this.$store.state.game, this.playerId)
    },
    star () {
      if (!this.starId) {
        return null
      }

      return GameHelper.getStarById(this.$store.state.game, this.starId)
    }
  }
}
</script>

<style scoped>
</style>
