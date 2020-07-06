<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{event.data.alias}}</a> has joined the game.
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
