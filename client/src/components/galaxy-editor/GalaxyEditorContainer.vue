<template>
  <div id="galaxyEditorContainer"></div>
</template>

<script>
import GalaxyEditor from '../../galaxy-editor/editor'

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
    this.galaxyEditor= GalaxyEditor
    this.galaxyEditor.createPixiApp()
  },

  mounted () {
    // Add the game canvas to the screen.
    this.$el.appendChild(this.galaxyEditor.app.view) // Add the pixi canvas to the element.

    // Bind to game events.
		/*
    this.onStarClickedHandler = this.onStarClicked.bind(this)
    this.onStarRightClickedHandler = this.onStarRightClicked.bind(this)
    this.onCarrierClickedHandler = this.onCarrierClicked.bind(this)
    this.onCarrierRightClickedHandler = this.onCarrierRightClicked.bind(this)
    this.onWaypointCreatedHandler = this.onWaypointCreated.bind(this)
    this.onObjectsClickedHandler = this.onObjectsClicked.bind(this)
		*/

  },

  destroyed () {
    this.galaxyEditor.destroy()
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)

    clearInterval(this.polling)
  },

  methods: {
    loadFromJSON(json) {
      this.galaxyEditor.loadFromJSON(json)
    },
    handleResize (e) {
      this.galaxyEditor.onResized()
    },
    onStarClicked (e) {
      this.$emit('onStarClicked', e._id)
    }
  }
}
</script>

<style scoped>
#galaxyEditorContainer {
  z-index: -1;
  left: 0;
  top: 0;
  margin: 0;
  height: 100%;
  overflow: hidden;
}
</style>
