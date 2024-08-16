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
      player: null,
      onlineStatus: '',
      isOnline: false,
      iconColour: '',
      intervalFunction: null
    }
  },
    mounted() {
      this.player = GameHelper.getPlayerById(this.$store.state.game, this.playerId)

      this.iconColour = !this.colour ? GameHelper.getFriendlyColour(this.$store.getters.getColourForPlayer(this.playerId)).value : this.colour

      let isHiddenPlayerOnlineStatus = GameHelper.isHiddenPlayerOnlineStatus(this.$store.state.game)

      if (!this.hideOnlineStatus && !isHiddenPlayerOnlineStatus) {
        this.intervalFunction = setInterval(this.recalculateOnlineStatus, 1000)
        this.recalculateOnlineStatus()
      }
  },
  destroyed () {
    clearInterval(this.intervalFunction)
  },
  methods: {
    recalculateOnlineStatus () {
      this.isOnline = GameHelper.isPlayerOnline(this.player)
      this.onlineStatus = GameHelper.getOnlineStatus(this.player)
    }
  },
  computed: {
    iconFilled () {
      const unknownStatus = this.player.isOnline == null;
      return unknownStatus || this.isOnline || this.solidGlyphOnly;
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
