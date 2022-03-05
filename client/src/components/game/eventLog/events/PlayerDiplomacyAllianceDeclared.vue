<template>
<div>
  <p>
      <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdFrom)">{{event.data.playerFromAlias}}</a> has established an <span class="text-success">alliance</span> with <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdTo)">{{event.data.playerToAlias}}</a>.
  </p>
  <p>
    <small><i>This event is private.</i></small>
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
      this.$emit('onOpenPlayerDetailRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
