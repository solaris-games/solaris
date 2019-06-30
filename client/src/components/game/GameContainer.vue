<template>
  <div></div>
</template>

<script>
import * as PIXI from 'pixi.js';
import GameContainer from '../../game/container';
import Background from '../../game/background';
import Map from '../../game/map';

export default {
  props: {
      game: Object
  },

  created() {
    window.addEventListener("resize", this.handleResize);
  },

  mounted() {
    this.gameContainer = GameContainer;
    this.gameContainer.setup(this.game);
    
    // Draw the background
    let background = new Background(new PIXI.Container(), this.gameContainer.viewport.worldWidth, this.gameContainer.viewport.worldHeight);
    background.draw();

    this.gameContainer.viewport.addChild(background.container);

    // Draw the map
    Map.setup(this.game);
    Map.draw();

    this.gameContainer.viewport.addChild(Map.container);

    // Add the game canvas to the screen.
    this.$el.appendChild(this.gameContainer.app.view); // Add the pixi canvas to the element.
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);

    Map.cleanup();
  },

  methods: {
    handleResize(e) {
      this.gameContainer.app.renderer.resize(
        window.innerWidth,
        window.innerHeight
      );
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
  margin: 0;
  height: 100%; 
  overflow: hidden;
}
</style>
