<template>
<div v-if="star && player">
  <p>
      The star <a href="javascript:;" @click="onOpenStarDetailRequested">{{star.name}}</a> has been captured
      by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a>.
  </p>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a> is awarded 
      <span class="text-success">${{event.data.creditsReward}}</span> credits.
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
      star: null,
      player: null
    }
  },
  mounted () {
    this.star = GameHelper.getStarById(this.$store.state.game, this.event.data.starId)
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerId)
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.player._id)
    }
  }
}
</script>

<style scoped>
</style>
