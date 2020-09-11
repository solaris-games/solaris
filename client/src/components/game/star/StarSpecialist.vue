<template>
    <div class="row bg-secondary pt-2 pb-0 mb-1" v-if="star">
        <div :class="{'col-7':canHireSpecialist,'col':!canHireSpecialist}">
            <p class="mb-2" v-if="!star.specialistId">
                This star does not have a specialist assigned. <a href="javascript:;">Read More</a>.
            </p>
            <div v-if="star.specialist">
                <h5 class="mb-1 text-warning">{{star.specialist.name}}</h5>
                <p>{{star.specialist.description}}</p>
            </div>
        </div>
        <div v-if="canHireSpecialist" class="col-5">
            <button class="btn btn-success" @click="onViewHireStarSpecialistRequested">Hire Specialist</button>
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
