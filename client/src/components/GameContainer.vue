<template>
  <div></div>
</template>

<script>
import * as PIXI from 'pixi.js';
import GameContainer from '../game/container';
import Background from '../game/background';
import Map from '../game/map';

export default {
  props: {
      game: Object
  },

  created() {
    window.addEventListener("resize", this.handleResize);
  },

  mounted() {
    this.gameContainer = new GameContainer();
    this.gameContainer.setup(this.game);
    
    // Draw the background
    let background = new Background(new PIXI.Container(), this.gameContainer.viewport.worldWidth, this.gameContainer.viewport.worldHeight);
    background.draw();

    this.gameContainer.viewport.addChild(background.container);

    // Draw the map
    let map = new Map(new PIXI.Container());
    map.draw(this.game);

    this.gameContainer.viewport.addChild(map.container);

    // Add the game canvas to the screen.
    this.$el.appendChild(this.gameContainer.app.view); // Add the pixi canvas to the element.
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
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
}
</style>
