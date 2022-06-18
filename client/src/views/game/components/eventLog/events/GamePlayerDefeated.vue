<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{event.data.alias}}</a> has been defeated.
  </p>
  <p v-if="event.data.openSlot">
    <small>The player slot has been opened for another player to join the game.</small>
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
