<template>
  <div></div>
</template>

<script>
import gameContainer from '../game/container'

export default {
  created() {
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("wheel", this.handleWheel);
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
    },
    handleWheel(e) {
      let direction = e.deltaY < e.deltaX ? 0.05 : -0.05;

      gameContainer.app.stage.scale.x += direction;
      gameContainer.app.stage.scale.y += direction;

      // TODO: Work out how to move the camera to the mouse pointer.
      //gameContainer.app.stage.transform.position = 
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
