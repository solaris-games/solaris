<template>
  <div></div>
</template>

<script>
import * as PIXI from "pixi.js";
import GameContainer from "../../game/container";
import Map from "../../game/map";
import { setTimeout } from 'timers';

export default {
  props: {
    game: Object
  },

  created() {
    window.addEventListener("resize", this.handleResize);
  },

  beforeMount() {
    this.gameContainer = GameContainer;
    this.gameContainer.setupViewport(this.game);
    this.gameContainer.setupUI(this.game);
  },

  mounted() {
    // Add the game canvas to the screen.
    this.$el.appendChild(this.gameContainer.app.view); // Add the pixi canvas to the element.

    this.gameContainer.draw();

    this.gameContainer.map.zoomToUser(this.game, this.$store.state.userId);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);

    this.gameContainer.map.cleanup();
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
