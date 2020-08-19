<template>
<div v-if="player">
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{player.alias}}</a> has been kicked for inactivity.
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
    this.player = GameHelper.getPlayerById(this.$store.state.game, this.event.data.playerId)
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.player._id)
    }
  }
}
</script>

<style scoped>
</style>
