<template>
<div>
  <p>
      You hired the specialist <span class="text-warning">{{event.data.specialistName}}</span> on the carrier <a href="javascript:;" @click="onOpenCarrierDetailRequested">{{event.data.carrierName}}</a>.
  </p>
  <p>
    <small><em>{{event.data.specialistDescription}}</em></small>
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  props: {
    event: Object
  },
  methods: {
    onOpenCarrierDetailRequested (e) {
      // Make sure the carrier exists before opening.
      let carrier = GameHelper.getCarrierById(this.$store.state.game, this.event.data.carrierId)

      if (carrier) {
        this.$emit('onOpenCarrierDetailRequested', this.event.data.carrierId)
      }
    }
  }
}
</script>

<style scoped>
</style>
