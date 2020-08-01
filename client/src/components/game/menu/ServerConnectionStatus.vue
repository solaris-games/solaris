<template>
<span :class="{
    'text-success':connectedToServer,
    'text-danger':!connectedToServer}"
    title="Server connection status">
    <i class="fas fa-circle"></i>
</span>
</template>

<script>
export default {
  data () {
      return {
        connectedToServer: true
      }
  },
    sockets: {
        connect: function() {
            this.connectedToServer = true
        },
        disconnect: function() {
            this.connectedToServer = false
        }
    }
}
</script>

<style scoped>
</style>
