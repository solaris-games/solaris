<template>
  <view-container>
    <view-title title="Purchase Failed" />

    <p>There was an problem processing your payment, please contact a developer for support.</p>

    <a href="https://discord.com/invite/v7PD33d" target="_blank" title="Discord" class="btn btn-success">
      <i class="fab fa-discord"></i> Discord
    </a>
  </view-container>
</template>

<script>
import ViewTitle from '../components/ViewTitle'
import ViewContainer from '../components/ViewContainer'

export default {
  components: {
    'view-container': ViewContainer,
    'view-title': ViewTitle
  }
}
</script>

<style scoped>
</style>
