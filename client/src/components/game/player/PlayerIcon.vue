<template>
  <!-- Note: We can't use Font Awesome because diamond and hexagon are premium icons -->
  <span v-if="player" class="span-container" :title="onlineStatus">
    <svg viewBox="0 0 512 512">
      <ellipse :style="{'stroke-width':64, 'fill': 'none', 'stroke': iconColour}" cx="256" cy="256" rx="224" ry="224" />
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
      }
      else if (this.player.isOnline) {
        this.onlineStatus = 'Online Now'
      }
      else {
        this.onlineStatus = moment(this.player.lastSeen).utc().fromNow()
      }
    },
    getIconSource () {
      return require(`../../../assets/icons/${this.player.shape}.svg`)
    }
  }
}
</script>

<style scoped>
.span-container {
  display: inline-block;
  height: 25px;
  width: 25px;
  margin-top: -12px;
  margin-right: -6px;
}
</style>
