<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{event.data.alias}}</a> has left the game.
  </p>
</div>
</template>

<script>
export default {
  props: {
    event: Object
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.event.data.playerId)
    }
  }
}
</script>

<style scoped>
</style>
