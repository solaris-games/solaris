<template>
  <div class="row">
    <div class="col-4 text-center pt-2 pb-1 ps-1 pe-1 card bg-dark">
        <h6>Economy</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-money-bill-wave text-success me-2"></i>{{ economy }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-money-bill-wave text-success me-2"></i>{{ economy }}</h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
    <div class="col-4 text-center pt-2 pb-1 ps-1 pe-1 card">
        <h6>Industry</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-tools text-warning me-2"></i>{{ industry }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-tools text-warning me-2"></i>{{ industry }}</h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
    <div class="col-4 text-center pt-2 pb-1 ps-1 pe-1 card bg-dark">
        <h6>Science</h6>
        <h3 v-if="!isSmallHeaders"><i class="fas fa-flask text-info me-2"></i>{{ science }}</h3>
        <h4 v-if="isSmallHeaders"><i class="fas fa-flask text-info me-2"></i>{{ science }}</h4>
        <div class="card-arrow">
          <div class="card-arrow-top-left"></div>
          <div class="card-arrow-top-right"></div>
          <div class="card-arrow-bottom-left"></div>
          <div class="card-arrow-bottom-right"></div>
        </div>
    </div>
  </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

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
.row {
  --bs-gutter-x: 0px;
}
</style>
