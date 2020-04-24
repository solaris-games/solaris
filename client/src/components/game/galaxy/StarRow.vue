<template>
<tr>
    <td><i class="fas fa-circle" v-if="star.ownedByPlayerId" :style="{ 'color': getColour() }"></i></td>
    <td><a href="#" @click="clickStar">{{star.name}}</a></td>
    <td><a href="#" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td><span v-if="star.upgradeCosts">{{star.infrastructure.economy}}</span></td>
    <td><span v-if="star.upgradeCosts">{{star.infrastructure.industry}}</span></td>
    <td><span v-if="star.upgradeCosts">{{star.infrastructure.science}}</span></td>
    <td><span v-if="star.upgradeCosts">${{star.upgradeCosts.economy}}</span></td>
    <td><span v-if="star.upgradeCosts">${{star.upgradeCosts.industry}}</span></td>
    <td><span v-if="star.upgradeCosts">${{star.upgradeCosts.science}}</span></td>
</tr>
</template>

<script>
import gameContainer from '../../../game/container'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
  },
  props: {
    game: Object,
    star: Object
  },
  methods: {
    getColour () {
      return gameHelper.getPlayerColour(this.game, this.star.ownedByPlayerId)
    },
    clickStar (e) {
      gameContainer.map.clickStar(this.star._id)

      e.preventDefault()
    },
    goToStar (e) {
      gameContainer.map.zoomToLocation(this.star.location)

      e.preventDefault()
    }
  }
}
</script>

<style scoped>
</style>
