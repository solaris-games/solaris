<template>
    <div class="row bg-secondary pt-2 pb-0 mb-1" v-if="star">
        <div class="col-7">
            <p class="mb-2" v-if="!star.specialistId">
                This star does not have a specialist assigned. <a href="javascript:;">Read More</a>.
            </p>
            <div v-if="star.specialist">
                <h5 class="mb-1 text-warning">{{star.specialist.name}}</h5>
                <p>{{star.specialist.description}}</p>
            </div>
        </div>
        <div class="col-5">
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
      star: null
    }
  },
  mounted () {
    this.star = GameHelper.getStarById(this.$store.state.game, this.starId)
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
