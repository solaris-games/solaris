<template>
    <div class="row bg-secondary pt-2 pb-0 mb-1" v-if="carrier">
        <div class="col">
            <h5 v-if="!carrier.specialist" class="pt-1 text-danger">None Assigned</h5>
            <h5 v-if="carrier.specialist" class="pt-1 text-warning">{{carrier.specialist.name}}</h5>
        </div>
        <div v-if="!$isHistoricalMode() && canHireSpecialist && !isGameFinished" class="col-auto">
            <button class="btn btn-sm btn-success" @click="onViewHireCarrierSpecialistRequested"><i class="fas fa-wrench"></i> Hire Specialist</button>
        </div>
        <div class="col-12 mt-2">
              <p v-if="carrier.specialist">{{carrier.specialist.description}}</p>
            <p class="mb-2" v-if="!carrier.specialistId">
                This carrier does not have a specialist assigned.
            </p>
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
      && this.carrier.orbiting
      && !this.carrier.isGift
  },
  methods: {
    onViewHireCarrierSpecialistRequested() {
        this.$emit('onViewHireCarrierSpecialistRequested', this.carrierId)
    }
  },
  computed: {
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
