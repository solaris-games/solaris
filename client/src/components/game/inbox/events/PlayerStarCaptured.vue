<template>
<div v-if="player">
  <p>
      The star <a href="javascript:;" @click="onOpenStarDetailRequested">{{event.data.starName}}</a> has been captured
      by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a>.
  </p>
  <p v-if="event.data.creditsReward">
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a> is awarded
      <span class="text-warning">${{event.data.creditsReward}}</span> credits.
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  components: {

  },
  props: {
    event: Object
  },
  data () {
    return {
      player: null
    }
  },
  mounted () {
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.event.data.capturedBy)
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.event.data.starId)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.player._id)
    }
  }
}
</script>

<style scoped>
</style>
