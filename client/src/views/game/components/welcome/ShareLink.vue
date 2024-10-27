<template>
<div class="text-center pb-2">
    <p>{{message}}</p>

    <p class="mb-0">Send them this address:</p>
    <p class="text-info" @click="copyToClipboard"><i class="fas fa-copy"></i> {{fullRoute}}</p>
</div>
</template>

<script>
export default {
  props: {
    message: String
  },
  data () {
    return {
      domain: '',
      protocol: '',
      fullRoute: ''
    }
  },
  async mounted () {
    this.protocol = window.location.protocol
    this.domain = window.location.host

    this.fullRoute = `${this.protocol}//${this.domain}/#${this.$route.fullPath}`
  },
  methods: {
    async copyToClipboard () {
      await navigator.clipboard.writeText(this.fullRoute)

      this.$toast.default(`Copied to clipboard.`, { type: 'success' })
    }
  }
}
</script>

<style scoped>
</style>
