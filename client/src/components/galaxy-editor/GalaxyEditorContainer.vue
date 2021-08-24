<template>
  <div id="galaxyEditorContainer" class='container'>
    <brush-tool :toolOptions='galaxyEditor.brushOptions'/>
    <star-tool v-if='galaxyEditor.selectedStar' :galaxyEditor='galaxyEditor'/>
    <div id="pixi-app" ref='pixiApp'/>
    <json-tool :galaxyEditor='galaxyEditor'/>
  </div>
</template>

<script>

import GalaxyEditor from '../../galaxy-editor/editor'

import StarToolVue from './StarTool.vue'
import BrushToolVue from './BrushTool.vue'
import JSONToolVue from './JSONTool.vue'

export default {
  components: {
    'star-tool': StarToolVue,
    'json-tool': JSONToolVue,
    'brush-tool': BrushToolVue
  },
  data () {
    return {
      galaxyEditor: GalaxyEditor
    }
  },

  created () {
    window.addEventListener('resize', this.handleResize)
  },

  beforeMount () {
    //this.galaxyEditor.vueContainer = this
    this.galaxyEditor.createPixiApp()
  },

  mounted () {
    this.$refs.pixiApp.appendChild(this.galaxyEditor.app.view) // Add the pixi canvas to the element.
  },

  destroyed () {
    this.galaxyEditor.destroy()
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.handleResize)
    clearInterval(this.polling)
  },

  methods: {
    //TODO
    handleResize (e) {
      this.galaxyEditor.onResized()
    }
  }
}
</script>

<style scoped>
#pixi-app {
  z-index: -1;
  left: 0;
  top: 0;
  margin: 0;
  height: 100%;
  overflow: hidden;
}
</style>
