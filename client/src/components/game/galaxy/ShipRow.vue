<template>
<tr>
    <td><i class="fas fa-circle" v-if="ship.ownedByPlayerId" :style="{ 'color': getColour() }"></i></td>
    <td><a href="javascript:;" @click="clickShip">{{ship.name}}</a></td>
    <td><a href="javascript:;" @click="goToShip"><i class="far fa-eye"></i></a></td>
    <td>
      <i v-if="ship.type === 0" class="fas fa-star"></i>
      <i v-if="ship.type === 1" class="fas fa-rocket"></i>
    </td>
    <td class="text-right">{{ship.ships}}</td>
</tr>
</template>

<script>
import gameContainer from '../../../game/container'
import gameHelper from '../../../services/gameHelper'

export default {
  components: {
  },
  props: {
    ship: Object
  },
  methods: {
    getColour () {
      return gameHelper.getPlayerColour(this.$store.state.game, this.ship.ownedByPlayerId)
    },
    clickShip (e) {
      if (this.ship.type == 0) {
        this.$emit('onOpenStarDetailRequested', this.ship._id)
      } else {
        this.$emit('onOpenCarrierDetailRequested', this.ship._id)
      }
    },
    goToShip (e) {
      gameContainer.map.panToLocation(this.ship.location)
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
