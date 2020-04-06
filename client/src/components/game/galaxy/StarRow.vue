<template>
<tr>
    <td><i class="fas fa-circle" v-if="star.ownedByPlayerId" :style="{ 'color': getColour() }"></i>{{star.playerId}}</td>
    <td><a href="#" @click="clickStar">{{star.name}}</a></td>
    <td><a href="#" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td>{{star.economy}}</td>
    <td>{{star.industry}}</td>
    <td>{{star.science}}</td>
    <td><span v-if="star.upgradeCosts">${{star.upgradeCosts.economy}}</span></td>
    <td><span v-if="star.upgradeCosts">${{star.upgradeCosts.industry}}</span></td>
    <td><span v-if="star.upgradeCosts">${{star.upgradeCosts.science}}</span></td>
</tr>
</template>

<script>
import gameContainer from '../../../game/container'

export default {
  components: {
  },
  props: {
    game: Object,
    star: Object
  },
  methods: {
    getColour () {
      let owningPlayer = this.game.galaxy.players.find(x => x._id === this.star.ownedByPlayerId)

      return owningPlayer.colour.value.replace('0x', '#')
    },
    clickStar (e) {
      gameContainer.map.clickStar(this.star._id)

      e.preventDefault()
    },
    goToStar (e) {
      gameContainer.map.zoomToStar(this.star)

      e.preventDefault()
    }
  }
}
</script>

<style scoped>
</style>
