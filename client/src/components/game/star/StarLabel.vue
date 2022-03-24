<template>
  <a href="javascript:;" @click="pan">{{starName}}<i class="fas fa-eye ml-1"></i></a>
</template>

<script>
import gameContainer from '../../../game/container'
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    starId: String,
    starName: String
  },
  mounted () {
    if (!this.starName) {
      this.starName = gameHelper.getStarById(this.$store.state.game, this.starId).name
    }
  },
  methods: {
    pan (e) {
      let star = gameHelper.getStarById(this.$store.state.game, this.starId)

      if (star) {
        gameContainer.map.panToStar(star)
      }
    }
  }
}
</script>

<style scoped>
</style>
