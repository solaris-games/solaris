<template>
  <!-- Note: We can't use Font Awesome because diamond and hexagon are premium icons -->
  <span v-if="player" class="span-container" :style="{'color': getFriendlyColour()}" :title="onlineStatus">
    {{glyph}}
  </span>
</template>
<script>
import GameHelper from '../../../services/gameHelper'
import moment from 'moment'

export default {
  props: {
    playerId: String,
    hideOnlineStatus: Boolean,
    solidGlyphOnly: Boolean
  },
  data () {
    return {
      player: null,
      onlineStatus: '',
      intervalFunction: null
    }
  },
  mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)

    if (!this.hideOnlineStatus) {
      this.intervalFunction = setInterval(this.recalculateOnlineStatus, 1000)
    }
  },
  destroyed () {
    clearInterval(this.intervalFunction)
  },
  methods: {
    getFriendlyColour () {
      return GameHelper.getFriendlyColour(this.player.colour.value)
    },
    recalculateOnlineStatus () {
      if (this.player.isOnline) {
        this.onlineStatus = 'Online Now'
      }
      else {
        this.onlineStatus = moment(this.player.lastSeen).utc().fromNow()
      }
    }
  },
  computed: {
    glyph () {
      switch (this.player.shape) {
          case 'circle': 
            return this.solidGlyphOnly || this.player.isOnline ? '●' : '○'
          case 'square':
            return this.solidGlyphOnly || this.player.isOnline ? '■' : '□'
          case 'diamond':
            return this.solidGlyphOnly || this.player.isOnline ? '♦' : '◇'
          case 'hexagon':
            return this.solidGlyphOnly || this.player.isOnline ? '⬢' : '⬡'
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
