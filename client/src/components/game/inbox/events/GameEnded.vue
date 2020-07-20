<template>
<div>
  <p>
      The game has ended, send congratulations to <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{getWinnerAlias()}}</a>!
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
  methods: {
    getWinnerAlias () {
      let winnerPlayer = GameHelper.getPlayerById(this.$store.state.game, this.$store.state.game.state.winner)

      return winnerPlayer.alias
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.$store.state.game.state.winner)
    }
  }
}
</script>

<style scoped>
</style>
