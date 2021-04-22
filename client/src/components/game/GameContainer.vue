<template>
  <div id="gameContainer"></div>
</template>

<script>
import { mapState } from 'vuex'
import GameContainer from '../../game/container'
import GameApiService from '../../services/api/game'

export default {
  data () {
    return {
      onStarClickedHandler: null,
      onStarRightClickedHandler: null,
      onCarrierClickedHandler: null,
      onWaypointCreatedHandler: null,
      onObjectsClickedHandler: null,
      polling: null
    }
  },

  created () {
    window.addEventListener('resize', this.handleResize)
  },

  beforeMount () {
    this.gameContainer = GameContainer
    this.gameContainer.setupApp(this.$store, this.$store.state.settings)
    this.loadGame(this.$store.state.game)
  },

  mounted () {
    // Add the game canvas to the screen.
    this.$el.appendChild(this.gameContainer.app.view) // Add the pixi canvas to the element.

    this.drawGame(this.$store.state.game)

    // Bind to game events.
    this.onStarClickedHandler = this.onStarClicked.bind(this)
    this.onStarRightClickedHandler = this.onStarRightClicked.bind(this)
    this.onCarrierClickedHandler = this.onCarrierClicked.bind(this)
    this.onCarrierRightClickedHandler = this.onCarrierRightClicked.bind(this)
    this.onWaypointCreatedHandler = this.onWaypointCreated.bind(this)
    this.onObjectsClickedHandler = this.onObjectsClicked.bind(this)

    this.gameContainer.map.on('onStarClicked', this.onStarClickedHandler)
    this.gameContainer.map.on('onStarRightClicked', this.onStarRightClickedHandler)
    this.gameContainer.map.on('onCarrierClicked', this.onCarrierClickedHandler)
    this.gameContainer.map.on('onCarrierRightClicked', this.onCarrierRightClickedHandler)
    this.gameContainer.map.on('onWaypointCreated', this.onWaypointCreatedHandler)
    this.gameContainer.map.on('onObjectsClicked', this.onObjectsClickedHandler)

    if (this.$store.state.userId) {
      this.polling = setInterval(this.touchPlayer, 60000)
      this.touchPlayer()
    }
  },

  destroyed () {
    this.gameContainer.map.off('onStarClicked', this.onStarClickedHandler)
    this.gameContainer.map.off('onStarRightClicked', this.onStarRightClickedHandler)
    this.gameContainer.map.off('onCarrierClicked', this.onCarrierClickedHandler)
    this.gameContainer.map.off('onCarrierRightClicked', this.onCarrierRightClickedHandler)
    this.gameContainer.map.off('onWaypointCreated', this.onWaypointCreatedHandler)
    this.gameContainer.map.off('onObjectsClicked', this.onObjectsClickedHandler)
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)

    clearInterval(this.polling)
  },

  methods: {
    loadGame (game) {
      this.gameContainer.setupViewport(game)
      this.gameContainer.setup(game, this.$store.state.settings)
    },
    updateGame (game) {
      this.gameContainer.reloadGame(game, this.$store.state.settings)
    },
    drawGame (game, panToUser = true) {
      this.gameContainer.draw()

      if (panToUser) {
        this.gameContainer.map.panToUser(game)
      }
    },
    async touchPlayer () {
      try {
        await GameApiService.touchPlayer(this.$store.state.game._id)
      } catch (e) {
        console.error(e)
      }
    },
    handleResize (e) {
      this.gameContainer.resize()
    },
    onStarClicked (e) {
      this.$emit('onStarClicked', e._id)
    },
    onStarRightClicked (e) {
      this.$emit('onStarRightClicked', e._id)
    },
    onCarrierClicked (e) {
      this.$emit('onCarrierClicked', e._id)
    },
    onCarrierRightClicked (e) {
      this.$emit('onCarrierRightClicked', e._id)
    },
    onWaypointCreated (e) {
      this.$emit('onWaypointCreated', e)
    },
    onObjectsClicked (e) {
      this.$emit('onObjectsClicked', e)
    }
  },

  computed: mapState(['game']),

  watch: {
    game (newGame, oldGame) {
      this.updateGame(newGame)
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
