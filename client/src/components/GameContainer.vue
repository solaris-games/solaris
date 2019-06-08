<template>
  <div></div>
</template>

<script>
import gameContainer from '../game/container'
import map from '../game/map'

export default {
  created() {
    window.addEventListener("resize", this.handleResize);
  },
  mounted() {
    this.$el.appendChild(gameContainer.app.view); // Add the pixi canvas to the element.
    
    gameContainer.viewport.on('zoomed', this.handleZoomed);
    gameContainer.viewport.on('moved', this.handleZoomed);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    //gameContainer.viewport.removeEventListener('zoomed', this.handleZoomed);
  },
  methods: {
    handleResize(e) {
      gameContainer.app.renderer.resize(
        window.innerWidth,
        window.innerHeight
      );

      map.refreshBackground();
    },
    handleZoomed(e) {
      map.refreshBackground();
    }
  }
};
</script>


<style scoped>
div {
  position: absolute;
  z-index: -1;
  left: 0;
  top: 0;
}
</style>
