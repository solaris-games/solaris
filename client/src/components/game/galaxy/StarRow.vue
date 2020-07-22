<template>
<tr>
    <td><i class="fas fa-circle" v-if="star.ownedByPlayerId" :style="{ 'color': getColour() }"></i></td>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="text-right"><span v-if="star.upgradeCosts">{{star.infrastructure.economy}}</span></td>
    <td class="text-right"><span v-if="star.upgradeCosts">{{star.infrastructure.industry}}</span></td>
    <td class="text-right"><span v-if="star.upgradeCosts">{{star.infrastructure.science}}</span></td>
    <td class="text-right"><span v-if="star.upgradeCosts">${{star.upgradeCosts.economy}}</span></td>
    <td class="text-right"><span v-if="star.upgradeCosts">${{star.upgradeCosts.industry}}</span></td>
    <td class="text-right"><span v-if="star.upgradeCosts">${{star.upgradeCosts.science}}</span></td>
</tr>
</template>

<script>
import gameContainer from '../../../game/container'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
  },
  props: {
    star: Object
  },
  methods: {
    getColour () {
      return gameHelper.getPlayerColour(this.$store.state.game, this.star.ownedByPlayerId)
    },
    clickStar (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    goToStar (e) {
      gameContainer.map.zoomToStar(this.star)
    }
  }
}
</script>

<style scoped>
</style>
