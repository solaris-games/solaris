<template>
  <div v-if="player" class="row" :style="{'background-color': getFriendlyColour(player.colour.value)}">
      <div class="col">
          <h4 class="pt-2">{{player.alias}} <span v-if="player.userId">(You)</span></h4>
      </div>
  </div>
</template>

<script>
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    player: Object
  },
  methods: {
    getFriendlyColour (colour) {
      return gameHelper.getFriendlyColour(colour)
    }
  }
}
</script>

<style scoped>
</style>
