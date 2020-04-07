<template>
<tr>
    <td><i class="fas fa-circle" v-if="carrier.ownedByPlayerId" :style="{ 'color': getColour() }"></i></td>
    <td><a href="#" @click="clickStar">{{carrier.name}}</a></td>
    <td><a href="#" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td>{{carrier.ships}}</td>
    <td>{{carrier.waypoints.length}}</td>
    <td>{{carrier.waypointsLooped}}</td>
    <td>{{carrier.eta}}</td>
    <td>{{carrier.totalEta}}</td>
</tr>
</template>

<script>
import gameContainer from '../../../game/container'

export default {
  components: {
  },
  props: {
    game: Object,
    carrier: Object
  },
  methods: {
    getColour () {
      let owningPlayer = this.game.galaxy.players.find(x => x._id === this.carrier.ownedByPlayerId)

      return owningPlayer.colour.value.replace('0x', '#')
    },
    clickStar (e) {
      gameContainer.map.clickCarrier(this.carrier._id) // TODO

      e.preventDefault()
    },
    goToStar (e) {
      gameContainer.map.zoomToLocation(this.carrier.location) // TODO

      e.preventDefault()
    }
  }
}
</script>

<style scoped>
</style>
