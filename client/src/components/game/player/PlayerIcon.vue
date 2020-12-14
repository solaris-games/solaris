<template>
<i class="fas" 
    :class="{'fa-circle': player.shape === 'circle','fa-square': player.shape === 'square'}" 
    :style="{'color': getFriendlyColour()}"></i>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    player: Object
  },
  methods: {
      getFriendlyColour () {
          return GameHelper.getFriendlyColour(this.player.colour.value)
      }
  }
}
</script>

<style scoped>
</style>
