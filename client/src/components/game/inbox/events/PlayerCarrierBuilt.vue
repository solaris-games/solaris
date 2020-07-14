<template>
<div v-if="star">
  <p>
      The carrier <a href="javascript:;" @click="onOpenCarrierDetailRequested">{{event.data.carrierName}}</a> has been built at 
      <a href="javascript:;" @click="onOpenStarDetailRequested">{{star.name}}</a>.
  </p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  components: {
      
  },
  props: {
    event: Object
  },
  data () {
    return {
      carrier: null,
      star: null
    }
  },
  mounted () {
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.event.data.carrierId)
    this.star = GameHelper.getStarById(this.$store.state.game, this.event.data.starId)
  },
  methods: {
    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', this.carrier)
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    }
  }
}
</script>

<style scoped>
</style>
