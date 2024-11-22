<template>
  <view-container :is-auth-page="true">
    <view-title title="Purchase Failed" />

    <p>There was an problem processing your payment, please contact a developer for support. You may have been charged, please do not try the transaction again.</p>

    <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord" class="btn btn-success">
      <i class="fab fa-discord"></i> Discord
    </a>
  </view-container>
</template>

<script>
import ViewTitle from '../components/ViewTitle.vue'
import ViewContainer from '../components/ViewContainer.vue'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle
  }
}
</script>

<style scoped>
</style>
