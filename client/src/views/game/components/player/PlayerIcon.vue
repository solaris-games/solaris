<template>
  <span v-if="player" class="span-container" :title="onlineStatus">
    <player-icon-shape :filled="iconFilled" :iconColour="iconColour" :shape="player.shape" />
  </span>
</template>
<script>
import GameHelper from '../../../../services/gameHelper'
import PlayerIconShape from './PlayerIconShape.vue'

export default {
  components: { PlayerIconShape },
  props: {
    playerId: String,
    hideOnlineStatus: Boolean,
    solidGlyphOnly: Boolean,
    colour: String
  },
  data () {
    return {
      onlineStatus: '',
      isOnline: false,
      intervalFunction: null
    }
  },
    mounted() {
      let isHiddenPlayerOnlineStatus = GameHelper.isHiddenPlayerOnlineStatus(this.$store.state.game)

      if (!this.hideOnlineStatus && !isHiddenPlayerOnlineStatus) {
        this.intervalFunction = setInterval(this.recalculateOnlineStatus, 1000)
        this.recalculateOnlineStatus()
      }
  },
  unmounted () {
    clearInterval(this.intervalFunction)
  },
  methods: {
    recalculateOnlineStatus () {
      this.isOnline = GameHelper.isPlayerOnline(this.player)
      this.onlineStatus = GameHelper.getOnlineStatus(this.player)
    }
  },
  computed: {
    iconColour () {
      return !this.colour ? GameHelper.getFriendlyColour(this.playerColour) : this.colour
    },
    iconFilled () {
      const unknownStatus = this.player.isOnline == null;
      return unknownStatus || this.isOnline || this.solidGlyphOnly;
    },
    player() {
      return GameHelper.getPlayerById(this.$store.state.game, this.playerId)
    },
    playerColour() {
      return this.$store.getters.getColourForPlayer(this.playerId).value
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

@media screen and (max-width: 576px) {
  .span-container {
    height: 10px;
    width: 10px;
    margin-top: -12px;
    margin-right: -6px;
  }
}
</style>
