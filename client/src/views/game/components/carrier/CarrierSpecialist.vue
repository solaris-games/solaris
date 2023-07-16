<template>
    <div class="row bg-dark pt-2 pb-0 mb-1" v-if="carrier">
        <div class="col">
          <h5 v-if="!carrier.specialist" class="pt-1 text-danger">None Assigned</h5>
          <h5 v-if="carrier.specialist" class="pt-1 text-warning">
            <specialist-icon :type="'carrier'" :defaultIcon="'user-astronaut'" :specialist="carrier.specialist"></specialist-icon>
            {{carrier.specialist.name}}
          </h5>
        </div>
        <div v-if="!$isHistoricalMode() && canHireSpecialist && !isGameFinished" class="col-auto">
            <button class="btn btn-sm btn-success" @click="onViewHireCarrierSpecialistRequested"><i class="fas fa-user-astronaut"></i> Hire Specialist</button>
        </div>
        <div class="col-12 mt-2">
            <p v-if="carrier.specialist">{{carrier.specialist.description}}</p>
            <p v-if="carrier.specialist && carrier.specialist.oneShot" class="text-warning"><small>This specialist cannot be replaced.</small></p>
            <p v-if="carrier.specialist && carrier.specialistExpireTick" class="text-warning"><small>This specialist expires on tick {{carrier.specialistExpireTick}}.</small></p>
            <p class="mb-2" v-if="!carrier.specialistId">
              <small><i>This carrier does not have a specialist assigned.</i></small>
            </p>
        </div>
    </div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'

export default {
  components: {
    'specialist-icon': SpecialistIconVue
  },
  props: {
    carrierId: String
  },
  data () {
    return {
      carrier: null,
      canHireSpecialist: false
    }
  },
  mounted () {
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)

    if (this.carrier.orbiting) {
      let userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
      let star = GameHelper.getCarrierOrbitingStar(this.$store.state.game, this.carrier)
      let isDeadStar = GameHelper.isDeadStar(star)

      this.canHireSpecialist = userPlayer
        && this.$store.state.game.settings.specialGalaxy.specialistCost !== 'none'  // Specs are enabled
        && userPlayer._id === this.carrier.ownedByPlayerId                     // User owns the carrier
        && star.ownedByPlayerId === this.carrier.ownedByPlayerId               // User owns the star
        && !isDeadStar                                                         // Star isn't dead
        && (!this.carrier.specialistId || !this.carrier.specialist.oneShot)         // Carrier doesn't already have a spec on it
    }
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
