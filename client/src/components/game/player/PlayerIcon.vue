<template>
  <span v-if="player" class="span-container" :title="onlineStatus">
    <svg viewBox="0 0 512 512">
      <ellipse v-if="player.shape === 'circle'" :style="getIconStyle()" cx="256" cy="256" rx="224" ry="224" />
      <rect v-if="player.shape === 'square'" :style="getIconStyle()" width="448" height="448" />
      <polygon v-if="player.shape === 'diamond'" :style="getIconStyle()" points="256 32, 480 256, 256 480, 32 256" />
      <polygon v-if="player.shape === 'hexagon'" :style="getIconStyle()" points="128,32 0,256 128,480 384,480 512,256 384,32 " transform="matrix(0.87415039,0,0,0.87415039,32.2175,32.2175)" />
    </svg>
  </span>
</template>
<script>
import GameHelper from '../../../services/gameHelper'
import moment from 'moment'

export default {
  props: {
    playerId: String,
    hideOnlineStatus: Boolean,
    solidGlyphOnly: Boolean,
    colour: String
  },
  data () {
    return {
      player: null,
      onlineStatus: '',
      isOnline: false,
      iconColour: '',
      intervalFunction: null
    }
  },
  mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)

    this.iconColour = !this.colour ? GameHelper.getFriendlyColour(this.player.colour.value) : this.colour

    let isHiddenPlayerOnlineStatus = GameHelper.isHiddenPlayerOnlineStatus(this.$store.state.game)

    if (!this.hideOnlineStatus && !isHiddenPlayerOnlineStatus) {
      this.intervalFunction = setInterval(this.recalculateOnlineStatus, 1000)
    }
  },
  destroyed () {
    clearInterval(this.intervalFunction)
  },
  methods: {
    recalculateOnlineStatus () {
      if (this.player.isOnline == null) {
        this.onlineStatus = ''
        this.isOnline = false;
      }
      else if (this.player.isOnline) {
        this.onlineStatus = 'Online Now'
        this.isOnline = true;
      }
      else {
        this.onlineStatus = moment(this.player.lastSeen).utc().fromNow()
        this.isOnline = false;
      }
    },
    getIconStyle () {
      if (this.isOnline || this.solidGlyphOnly) {
        return { 'fill': this.iconColour, 'stroke': 'none' }
      } else {
        return {'stroke-width':64, 'fill': 'none', 'stroke': this.iconColour}
      }
    }
  }
}
</script>

<style scoped>
.span-container {
  display: inline-block;
  height: 18px;
  width: 18px;
  margin-top: -12px;
  margin-right: -6px;
}
</style>
