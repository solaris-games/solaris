<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.purchasedByPlayerId)">{{event.data.purchasedByPlayerAlias}}</a> has awarded the <span class="text-warning">{{event.data.badgeName}}</span> badge to <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.purchasedForPlayerId)">{{event.data.purchasedForPlayerAlias}}</a>.
  </p>
</div>
</template>

<script>
export default {
  props: {
    event: Object
  },
  methods: {
    onOpenPlayerDetailRequested (playerId) {
      this.$emit('onOpenPlayerDetailRequested', playerId)
    }
  }
}
</script>

<style scoped>
</style>
