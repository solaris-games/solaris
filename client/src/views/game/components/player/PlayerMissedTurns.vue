<template>
<div v-if="player && player.missedTurns" class="row bg-warning">
  <div class="col pt-1 pb-1 mt-0 mb-0">
    <p class="mb-0 mt-0">
      <small><i class="fas fa-dice"></i> Missed {{player.missedTurns}} turn(s).</small>
    </p>
  </div>
</div>
</template>

<script>
export default {
  props: {
    player: Object
  }
}
</script>

<style scoped>
</style>
