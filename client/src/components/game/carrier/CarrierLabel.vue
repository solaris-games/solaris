<template>
  <a href="javascript:;" @click="pan">{{carrierName}}<i class="fas fa-eye ml-1"></i></a>
</template>

<script>
import gameContainer from '../../../game/container'
import gameHelper from '../../../services/gameHelper'

export default {
  props: {
    carrierId: String,
    carrierName: String
  },
  mounted () {
    if (!this.carrierName) {
      let carrier = gameHelper.getCarrierById(this.$store.state.game, this.carrierId)

      this.carrierName = carrier ? carrier.name : 'Unknown'
    }
  },
  methods: {
    pan (e) {
      let carrier = gameHelper.getCarrierById(this.$store.state.game, this.carrierId)

      if (carrier) {
        gameContainer.map.panToStar(carrier)
      }
    }
  }
}
</script>

<style scoped>
</style>
