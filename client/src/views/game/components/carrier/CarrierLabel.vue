<template>
  <a href="javascript:;" @click="pan">{{actualCarrierName}}<i class="fas fa-eye ms-1"></i></a>
</template>

<script>
import gameContainer from '../../../../game/container'
import gameHelper from '../../../../services/gameHelper'

export default {
  props: {
    carrierId: String,
    carrierName: String
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
      let carrier = gameHelper.getCarrierById(this.$store.state.game, this.carrierId)

      this.actualCarrierName = carrier ? carrier.name : 'Unknown'
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
