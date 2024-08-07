<template>
<div>
  <p>
      You hired the specialist <span class="text-warning">{{event.data.specialistName}}</span> on the carrier <carrier-label :carrierId="event.data.carrierId" :carrierName="event.data.carrierName"/>.
  </p>
  <p>
    <small><em>{{event.data.specialistDescription}}</em></small>
  </p>
</div>
</template>

<script>
import CarrierLabelVue from '../../carrier/CarrierLabel.vue'

export default {
  components: {
    'carrier-label': CarrierLabelVue
  },
  props: {
    event: Object
  }
}
</script>

<style scoped>
</style>
