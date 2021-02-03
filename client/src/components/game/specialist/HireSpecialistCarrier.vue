<template>
<div class="menu-page container">
    <menu-title title="Hire Specialist" @onCloseRequested="onCloseRequested">
      <button @click="onOpenCarrierDetailRequested(carrier)" class="btn btn-primary" title="Back to Carrier"><i class="fas fa-arrow-left"></i></button>
    </menu-title>

    <div class="row bg-primary">
        <div class="col">
            <h4 class="mt-2">Carrier</h4>
        </div>
    </div>

    <loading-spinner :loading="isLoadingSpecialists"/>

    <div class="row mb-2 pt-1 pb-1 bg-secondary" v-if="!isLoadingSpecialists && carrier">
        <div class="col">
            <a href="javascript:;" @click="onOpenCarrierDetailRequested(carrier)">{{carrier.name}}</a>
        </div>
        <div class="col-auto">
            <i class="fas fa-map-marker-alt"></i>
            <i class="fas fa-sync ml-1" v-if="carrier.waypointsLooped"></i> {{carrier.waypoints.length}}
        </div>
        <div class="col-auto">
            {{carrier.ships}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <div v-if="!isLoadingSpecialists && specialists.length">
        <div v-for="specialist in specialists" :key="specialist.id" class="row mb-2 pt-1 pb-1 bg-secondary">
            <div class="col mt-2">
                <h5 class="pt-1 text-warning">
                    <specialist-icon :type="'carrier'" :defaultIcon="'rocket'" :specialist="specialist"/>
                    <span class="ml-1">{{specialist.name}}</span>
                </h5>
            </div>
            <div class="col-auto mt-2">
                <button class="btn btn-sm btn-success" v-if="!(carrier.specialistId && carrier.specialist.id === specialist.id)" :disabled="isHiringSpecialist || userPlayer.credits < specialist.cost" @click="hireSpecialist(specialist)">Hire for ${{specialist.cost}}</button>
                <span class="badge badge-primary" v-if="carrier.specialistId && carrier.specialist.id === specialist.id">Active</span>
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
      carrierId: String
  },
  data () {
    return {
      userPlayer: null,
      carrier: null,
      specialists: [],
      isLoadingSpecialists: false,
      isHiringSpecialist: false
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)

    this.loadSpecialists()
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenCarrierDetailRequested (carrier) {
      this.$emit('onOpenCarrierDetailRequested', carrier._id)
    },
    async loadSpecialists () {
        this.isLoadingSpecialists = true

        try {
            let response = await SpecialistApiService.getCarrierSpecialists(this.$store.state.game._id)

            if (response.status === 200) {
                this.specialists = response.data
            }
        } catch (err) {
            console.error(err)
        }

        this.isLoadingSpecialists = false
    },
    async hireSpecialist (specialist) {
        this.isHiringSpecialist = true

        try {
            let response = await SpecialistApiService.hireCarrierSpecialist(this.$store.state.game._id, this.carrierId, specialist.id)

            if (response.status === 200) {
                this.$toasted.show(`${specialist.name} has been hired for the carrier ${this.carrier.name}.`)

                this.carrier.specialistId = specialist.id
                this.carrier.specialist = specialist
                this.userPlayer.credits -= specialist.cost

                if (response.data.waypoints) {
                    this.carrier.waypoints = response.data.waypoints.waypoints
                    this.carrier.waypointsLooped = response.data.waypoints.waypointsLooped
                }

                GameContainer.reloadCarrier(this.carrier)
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
