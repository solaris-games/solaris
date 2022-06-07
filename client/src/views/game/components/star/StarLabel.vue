<template>
  <a href="javascript:;" @click="pan">{{actualStarName}}<i class="fas fa-eye ms-1"></i></a>
</template>

<script>
import gameContainer from '../../../../game/container'
import gameHelper from '../../../../services/gameHelper'

export default {
  props: {
    starId: String,
    starName: String
  },
  data () {
    return {
      actualStarName: null
    }
  },
  mounted () {
    if (this.starName != null) {
      this.actualStarName = this.starName
    } else {
      let star = gameHelper.getStarById(this.$store.state.game, this.starId)

      this.actualStarName = star ? star.name : 'Unknown'
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
