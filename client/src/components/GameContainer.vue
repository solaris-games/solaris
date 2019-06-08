<template>
  <div></div>
</template>

<script>
import gameContainer from '../game/container'

export default {
  created() {
    window.addEventListener("resize", this.handleResize);
  },
  mounted() {
    this.$el.appendChild(gameContainer.app.view); // Add the pixi canvas to the element.
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    handleResize(e) {
      console.log(window.innerWidth + " " + window.innerHeight);
      gameContainer.app.renderer.resize(
        window.innerWidth,
        window.innerHeight
      );
    }
  }
};
</script>


<style scoped>
#gameContainer {
  position: absolute;
  z-index: -1;
  left: 0;
  top: 0;
}
</style>
