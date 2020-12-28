<template>
  <!-- Note: We can't use Font Awesome because diamond and hexagon are premium icons -->
  <span class="span-container" :style="{'color': getFriendlyColour()}">
    {{getGlyph()}}
  </span>
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
      },
      getGlyph () {
        switch (this.player.shape) {
          case 'circle': 
            return '●'
          case 'square':
            return '■'
          case 'diamond':
            return '♦'
          case 'hexagon':
            return '⬢'
        }
      }
  }
}
</script>

<style scoped>
.span-container {
  display: inline-block;
  font-size: 25px;
  margin-top: -12px;
  margin-right: -6px;
}
</style>
