<template>
  <div id="gameContainer"></div>
</template>

<script>
import GameContainer from '../../game/container'

export default {
  props: {
    game: Object
  },

  created () {
    window.addEventListener('resize', this.handleResize)

    this.sockets.listener.subscribe('tick', (data) => {
      console.log('Game ticked')

      // TODO: Reload the game.
    })
  },

  beforeMount () {
    this.gameContainer = GameContainer

    this.loadGame(this.game)

    this.$socket.emit('join', this.game._id)
  },

  mounted () {
    // Add the game canvas to the screen.
    this.$el.appendChild(this.gameContainer.app.view) // Add the pixi canvas to the element.

    this.drawGame(this.game)

    // Bind to game events.
    this.gameContainer.map.on('onStarClicked', this.onStarClicked.bind(this))
    this.gameContainer.map.on('onCarrierClicked', this.onCarrierClicked.bind(this))
    this.gameContainer.map.on('onWaypointCreated', this.onWaypointCreated.bind(this))
    this.gameContainer.map.on('onObjectsClicked', this.onObjectsClicked.bind(this))
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
  },

  destroyed () {
    this.$socket.emit('leave')

    this.sockets.listener.unsubscribe('tick')
  },

  methods: {
    loadGame (game) {
      this.gameContainer.setupViewport(game)
      this.gameContainer.setupUI(game)
    },
    drawGame (game) {
      this.gameContainer.draw()

      this.gameContainer.map.zoomToUser(game)
    },
    handleResize (e) {
      this.gameContainer.app.renderer.resize(
        window.innerWidth,
        window.innerHeight
      )
    },
    onStarClicked (e) {
      this.$emit('onStarClicked', e)
    },
    onCarrierClicked (e) {
      this.$emit('onCarrierClicked', e)
    },
    onWaypointCreated (e) {
      this.$emit('onWaypointCreated', e)
    },
    onObjectsClicked (e) {
      this.$emit('onObjectsClicked', e)
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
#gameContainer {
  position: absolute;
  z-index: -1;
  left: 0;
  top: 0;
  margin: 0;
  height: 100%;
  overflow: hidden;
}
</style>
