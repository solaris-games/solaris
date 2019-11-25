<template>
  <div></div>
</template>

<script>
import GameContainer from '../../game/container'

export default {
  props: {
    game: Object
  },

  created () {
    window.addEventListener('resize', this.handleResize)
  },

  beforeMount () {
    this.gameContainer = GameContainer

    this.loadGame(this.game)
  },

  mounted () {
    // Add the game canvas to the screen.
    this.$el.appendChild(this.gameContainer.app.view) // Add the pixi canvas to the element.

    this.drawGame(this.game)

    // Bind to game events.
    this.gameContainer.map.on('onStarClicked', this.onStarClicked.bind(this))
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)

    // Remove game events.
    this.gameContainer.map.removeListener('onStarClicked', this.onStarClicked)

    // Call game cleanup to remove events.
    this.gameContainer.map.cleanup()
  },

  methods: {
    loadGame (game) {
      this.gameContainer.setupViewport(this.game)
      this.gameContainer.setupUI(this.game)
    },
    drawGame (game) {
      this.gameContainer.draw()

      this.gameContainer.map.zoomToUser(this.game, this.$store.state.userId)
    },
    handleResize (e) {
      this.gameContainer.app.renderer.resize(
        window.innerWidth,
        window.innerHeight
      )
    },
    onStarClicked (e) {
      this.$emit('onStarClicked', e)
    }
  },

  watch: {
    game (newGame, oldGame) {
      this.loadGame(newGame)
      this.drawGame(newGame)
    }
  }
}
</script>

<style scoped>
div {
  position: absolute;
  z-index: -1;
  left: 0;
  top: 0;
  margin: 0;
  height: 100%;
  overflow: hidden;
}
</style>
