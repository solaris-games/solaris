<template>
    <div class="row bg-secondary pt-2 pb-0 mb-1" v-if="star">
        <div class="col">
            <h5 v-if="!star.specialist" class="pt-1 text-danger">None Assigned</h5>
            <h5 v-if="star.specialist" class="pt-1 text-warning">{{star.specialist.name}}</h5>
        </div>
        <div v-if="canHireSpecialist" class="col-auto">
            <button class="btn btn-sm btn-success" @click="onViewHireStarSpecialistRequested"><i class="fas fa-wrench"></i> Hire Specialist</button>
        </div>
        <div class="col-12 mt-2">
              <p v-if="star.specialist">{{star.specialist.description}}</p>
            <p class="mb-2" v-if="!star.specialistId">
                This star does not have a specialist assigned. <a href="javascript:;">Read More</a>.
            </p>
        </div>
    </div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    starId: String
  },
  data () {
    return {
      userPlayer: null,
      star: null,
      canHireSpecialist: false
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.star = GameHelper.getStarById(this.$store.state.game, this.starId)

    this.canHireSpecialist = this.$store.state.game.settings.specialGalaxy.specialistCost !== 'none'
      && this.userPlayer._id === this.star.ownedByPlayerId
  },
  methods: {
    onViewHireStarSpecialistRequested() {
        this.$emit('onViewHireStarSpecialistRequested', this.starId)
    }
  }
}
</script>

<style scoped>
</style>
