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

    <div class="row mb-2 pt-1 pb-1 bg-secondary" v-if="star">
        <div class="col">
            <a href="javascript:;" @click="onOpenStarDetailRequested(star)">{{star.name}}</a>
        </div>
        <div class="col-auto">
            {{star.ships}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <div v-if="specialists && specialists.length">
        <div v-for="specialist in specialists" :key="specialist.id" class="row mb-2 pt-1 pb-1 bg-secondary">
            <div class="col mt-2">
                <h5 class="pt-1 text-warning">
                    <specialist-icon :type="'star'" :defaultIcon="'star'" :specialist="specialist"/>
                    <span class="ml-1">{{specialist.name}}</span>
                </h5>
            </div>
            <div class="col-auto mt-2">
                <button class="btn btn-sm btn-success" v-if="!(star.specialistId && star.specialist.id === specialist.id)" :disabled="$isHistoricalMode() || isHiringSpecialist || cantAffordSpecialist(specialist) || isCurrentSpecialistOneShot" @click="hireSpecialist(specialist)">Hire for {{getSpecialistActualCostString(specialist)}}</button>
                <span class="badge badge-primary" v-if="star.specialistId && star.specialist.id === specialist.id">Active</span>
            </div>
            <div class="col-12 mt-2">
                <p>{{specialist.description}}</p>
                <p v-if="specialist.oneShot" class="text-warning"><small>This specialist cannot be replaced.</small></p>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import MenuTitleVue from '../MenuTitle'
import GameContainer from '../../../game/container'
import GameHelper from '../../../services/gameHelper'
import SpecialistApiService from '../../../services/api/specialist'
import SpecialistIconVue from '../specialist/SpecialistIcon'

export default {
  components: {
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
      isHiringSpecialist: false
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.star = GameHelper.getStarById(this.$store.state.game, this.starId)

    this.specialists = this.$store.state.starSpecialists;
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenStarDetailRequested (star) {
      this.$emit('onOpenStarDetailRequested', star._id)
    },
    async hireSpecialist (specialist) {
        if (!await this.$confirm('Hire specialist', `Are you sure you want to hire a ${specialist.name} for ${this.getSpecialistActualCostString(specialist)}?`)) {
          return
        }

        if (this.star.specialistId && !await this.$confirm('Replace specialist', `Are you sure you want to replace the existing specialist ${this.star.specialist.name} for a ${specialist.name}?`)) {
          return
        }
        
        this.isHiringSpecialist = true

        try {
            let response = await SpecialistApiService.hireStarSpecialist(this.$store.state.game._id, this.starId, specialist.id)

            if (response.status === 200) {
                this.$toasted.show(`${specialist.name} has been hired for the star ${this.star.name}.`)

                let currency = this.$store.state.game.settings.specialGalaxy.specialistsCurrency

                this.star.specialistId = specialist.id
                this.star.specialist = specialist
                this.userPlayer[currency] -= specialist.cost[currency]

                this.userPlayer.stats.totalStarSpecialists++
                this.userPlayer.stats.totalSpecialists++

                GameContainer.reloadStar(this.star)
            }
        } catch (err) {
            console.error(err)
        }
        
        this.isHiringSpecialist = false
    },
    getSpecialistActualCost (specialist) {
        return specialist.cost[this.$store.state.game.settings.specialGalaxy.specialistsCurrency]
    },
    getSpecialistActualCostString (specialist) {
      let actualCost = this.getSpecialistActualCost(specialist)

      switch (this.$store.state.game.settings.specialGalaxy.specialistsCurrency) {
        case 'credits':
          return `$${actualCost}`
        case 'creditsSpecialists':
          return `${actualCost} token${actualCost > 1 ? 's' : ''}`
      }
    },
    cantAffordSpecialist (specialist) {
        return this.userPlayer[this.$store.state.game.settings.specialGalaxy.specialistsCurrency] < this.getSpecialistActualCost(specialist)
    }
  },
  computed: {
    isCurrentSpecialistOneShot () {
      return this.star.specialist && this.star.specialist.oneShot
    }
  }
}
</script>

<style scoped>
</style>
