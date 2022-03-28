<template>
<div>
  <p>
    <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdFrom)">{{event.data.playerFromAlias}}</a>
    has changed their
    <strong>diplomatic status</strong>
    with
    <a href="javascript:;" @click="onOpenPlayerDetailRequested(event.data.playerIdTo)">{{event.data.playerToAlias}}</a>
    to
    <span :class="getDiplomaticStatusClass(event.data.statusTo)">{{event.data.statusTo}}</span>.
  </p>
  <p>
    <small>The combined diplomatic status is now: <span :class="getDiplomaticStatusClass(event.data.actualStatus)">{{event.data.actualStatus}}</span></small>
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
    },
    getDiplomaticStatusClass (status) {
      switch (status) {
        case 'enemies': return 'text-danger'
        case 'allies': return 'text-success'
        case 'neutral': return 'text-info'
      }

      return ''
    }
  }
}
</script>

<style scoped>
</style>
