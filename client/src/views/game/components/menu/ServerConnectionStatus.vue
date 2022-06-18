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
    connect: function () {
      this.connectedToServer = true
    },
    disconnect: function () {
      this.connectedToServer = false

      // Commented out for now as server game tick lag is causing disconnects.
      // Need to fix that first.
      // this.$toasted.show(`There was a problem and the connection to the server was lost, it is recommended to refresh the page.`, {
      //   duration: null,
      //   type: 'error',
      //   action: [
      //     {
      //       text: 'Dismiss',
      //       onClick: (e, toastObject) => {
      //         toastObject.goAway(0)
      //       }
      //     },
      //     {
      //       text: 'Reload',
      //       onClick: (e, toastObject) => {
      //         toastObject.goAway(0)

      //         location.reload()
      //       }
      //     }
      //   ]
      // })
    }
  }
}
</script>

<style scoped>
</style>
