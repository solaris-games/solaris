<template>
<div class="menu-page container">
    <menu-title title="Hire Specialist" @onCloseRequested="onCloseRequested">
      <button @click="onOpenStarDetailRequested(star)" class="btn btn-sm btn-primary" title="Back to Star"><i class="fas fa-arrow-left"></i></button>
    </menu-title>

    <div class="row bg-primary">
        <div class="col">
            <h4 class="mt-2">Star</h4>
        </div>
    </div>

    <loading-spinner :loading="isLoadingSpecialists"/>

    <div class="row mb-2 pt-1 pb-1 bg-secondary" v-if="!isLoadingSpecialists && star">
        <div class="col">
            <a href="javascript:;" @click="onOpenStarDetailRequested(star)">{{star.name}}</a>
        </div>
        <div class="col-auto">
            {{star.garrison}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <div v-if="!isLoadingSpecialists && specialists.length">
        <div v-for="specialist in specialists" :key="specialist.id" class="row mb-2 pt-1 pb-1 bg-secondary">
            <div class="col mt-2">
                <h5 class="pt-1 text-warning">
                    <specialist-icon :type="'star'" :defaultIcon="'star'" :specialist="specialist"/>
                    <span class="ml-1">{{specialist.name}}</span>
                </h5>
            </div>
            <div class="col-auto mt-2">
                <button class="btn btn-sm btn-success" v-if="!(star.specialistId && star.specialist.id === specialist.id)" :disabled="isHiringSpecialist || userPlayer.credits < specialist.cost" @click="hireSpecialist(specialist)">Hire for ${{specialist.cost}}</button>
                <span class="badge badge-primary" v-if="star.specialistId && star.specialist.id === specialist.id">Active</span>
            </div>
            <div class="col-12 mt-2">
                <p>{{specialist.description}}</p>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import LoadingSpinner from '../../LoadingSpinner'
import MenuTitleVue from '../MenuTitle'
import GameContainer from '../../../game/container'
import GameHelper from '../../../services/gameHelper'
import SpecialistApiService from '../../../services/api/specialist'
import SpecialistIconVue from '../specialist/SpecialistIcon'

export default {
  components: {
    'loading-spinner': LoadingSpinner,
    'menu-title': MenuTitleVue,
    'specialist-icon': SpecialistIconVue
  },
  props: {
      starId: String
  },
  data () {
    return {
      userPlayer: null,
      star: null,
      specialists: [],
      isLoadingSpecialists: false,
      isHiringSpecialist: false
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.star = GameHelper.getStarById(this.$store.state.game, this.starId)

    this.loadSpecialists()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenStarDetailRequested (star) {
      this.$emit('onOpenStarDetailRequested', star._id)
    },
    async loadSpecialists () {
        this.isLoadingSpecialists = true

        try {
            let response = await SpecialistApiService.getStarSpecialists(this.$store.state.game._id)

            if (response.status === 200) {
                this.specialists = response.data
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoadingSpecialists = false
    },
    async hireSpecialist (specialist) {
        if (!confirm(`Are you sure you want to hire a ${specialist.name} for $${specialist.cost}?`)) {
            return
        }
        
        this.isHiringSpecialist = true

        try {
            let response = await SpecialistApiService.hireStarSpecialist(this.$store.state.game._id, this.starId, specialist.id)

            if (response.status === 200) {
                this.$toasted.show(`${specialist.name} has been hired for the star ${this.star.name}.`)

                this.star.specialistId = specialist.id
                this.star.specialist = specialist
                this.userPlayer.credits -= specialist.cost

                GameContainer.reloadStar(this.star)
            }
        } catch (err) {
            console.error(err)
        }
        
        this.isHiringSpecialist = false
    }
  }
}
</script>

<style scoped>
</style>
