<template>
    <div class="row bg-secondary pt-2 pb-0 mb-1" v-if="carrier">
        <div :class="{'col-7':canHireSpecialist,'col':!canHireSpecialist}">
            <p class="mb-2" v-if="!carrier.specialistId">
                This carrier does not have a specialist assigned. <a href="javascript:;">Read More</a>.
            </p>
            <div v-if="carrier.specialist">
                <h5 class="mb-1 text-warning">{{carrier.specialist.name}}</h5>
                <p>{{carrier.specialist.description}}</p>
            </div>
        </div>
        <div v-if="canHireSpecialist" class="col-5">
            <button class="btn btn-success" @click="onViewHireCarrierSpecialistRequested">Hire Specialist</button>
        </div>
    </div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    carrierId: String
  },
  data () {
    return {
      userPlayer: null,
      carrier: null,
      canHireSpecialist: false
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)

    this.canHireSpecialist = this.$store.state.game.settings.specialGalaxy.specialistCost !== 'none'
      && this.userPlayer._id === this.carrier.ownedByPlayerId
  },
  methods: {
    onViewHireCarrierSpecialistRequested() {
        this.$emit('onViewHireCarrierSpecialistRequested', this.carrierId)
    }
  }
}
</script>

<style scoped>
</style>
