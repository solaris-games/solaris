<template>
  <p v-if="isGameNotStarted && isNewPlayerGame" class="text-center">
    <small>This game is for <span class="text-success">new players</span>, it will start when <span class="text-warning">2 players</span> have joined the game.</small>
  </p>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  computed: {
    isGameNotStarted () {
      return GameHelper.isGameNotStarted(this.$store.state.game)
    },
    isNewPlayerGame () {
      return GameHelper.isNewPlayerGame(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
