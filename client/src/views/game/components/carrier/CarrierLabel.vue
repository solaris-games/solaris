<template>
  <a href="javascript:;" @click="pan">{{actualCarrierName}}<i class="fas fa-eye ms-1"></i></a>
</template>

<script>
import gameHelper from '../../../../services/gameHelper'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "../../../../eventBusEventNames/mapCommand";

export default {
  props: {
    carrierId: String,
    carrierName: String
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      actualCarrierName: null
    }
  },
  mounted () {
    if (this.carrierName) {
      this.actualCarrierName = this.carrierName
    } else {
      const carrier = gameHelper.getCarrierById(this.$store.state.game, this.carrierId)

      this.actualCarrierName = carrier ? carrier.name : 'Unknown'
    }
  },
  methods: {
    pan (e) {
      const carrier = gameHelper.getCarrierById(this.$store.state.game, this.carrierId)

      if (carrier) {
        this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: carrier });
      }
    }
  }
}
</script>

<style scoped>
</style>
