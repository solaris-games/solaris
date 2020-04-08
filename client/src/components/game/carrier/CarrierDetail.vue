<template>
<div class="container">
    <h3 class="pt-2">{{carrier.data.name}}</h3>

    <div class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="carrier.data.ownedByPlayerId == currentPlayerId">A carrier under your command.<br/>Give it orders to capture more stars!</p>
        <p v-if="carrier.data.ownedByPlayerId != null && carrier.data.ownedByPlayerId != currentPlayerId">This carrier is controlled by [{{getCarrierOwningPlayer().alias}}].</p>
      </div>
    </div>

    <!-- TODO: This should be a component -->
    <div v-if="carrier.data.ships" class="row mb-0 pt-3 pb-3 bg-primary">
        <div class="col">
            Ships
        </div>
        <div class="col text-right">
            {{carrier.data.ships}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <h4 class="pt-2">Navigation</h4>

    <div v-if="getCarrierOwningPlayer() == getUserPlayer()" class="mt-2">
      <div v-if="carrier.data.orbiting" class="row bg-secondary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p class="mb-2 align-middle">Orbiting: <a href="">{{getCarrierOrbitingStar().name}}</a></p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary mb-2">Ship Transfer</button>
        </div>
      </div>

      <div v-if="!carrier.data.waypoints.length" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col">
          <p class="mb-2">Waypoints: None.</p>
        </div>
      </div>

      <!-- TODO: This should be a component -->
      <!-- v-if="carrier.data.waypoints.length" -->
      <div class="row pt-0 pb-0 mb-0">
        <table class="table table-striped table-hover">
          <thead>
              <tr class="bg-primary">
                  <td>Delay</td>
                  <td>Destination</td>
                  <td v-if="!showAction">ETA</td>
                  <td v-if="showAction">Action</td>
                  <td class="text-right">
                    <a href="" @click="toggleShowAction">Show {{showAction ? 'Action' : 'ETA'}}</a>
                  </td>
              </tr>
          </thead>
          <tbody>
              <!-- TODO: Rows should be components -->
              <tr>
                  <td>0</td>
                  <td>Star 1</td>
                  <td v-if="!showAction">1d 2h 3m 4s</td>
                  <td v-if="showAction">Collect All Ships</td>
                  <td class="text-right"><a href="">Edit</a></td>
              </tr>
              <tr>
                  <td>4</td>
                  <td>Star 2</td>
                  <td v-if="!showAction">2h 3m 4s</td>
                  <td v-if="showAction">Collect All Ships</td>
                  <td class="text-right"><a href="">Edit</a></td>
              </tr>
              <tr>
                  <td>0</td>
                  <td>Star 3</td>
                  <td v-if="!showAction">3m 4s</td>
                  <td v-if="showAction">Drop All Ships</td>
                  <td class="text-right"><a href="">Edit</a></td>
              </tr>
          </tbody>
        </table>
      </div>

      <div v-if="carrier.data.waypoints.length" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p class="mb-2">Looping: Disabled</p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary mb-2">Enable Looping</button>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p v-if="carrier.data.waypoints.length" class="mb-2">ETA: 0d 0h 0m 0s (0h 0m 0s)</p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-success mb-2">Edit Waypoints</button>
        </div>
      </div>
    </div>
    
    <playerOverview v-if="getCarrierOwningPlayer()" :game="game" :player="getCarrierOwningPlayer()" />
</div>
</template>

<script>
import ApiService from '../../../services/apiService'
import GameHelper from '../../../services/gameHelper'
import PlayerOverview from '../player/Overview'

export default {
  components: {
    'playerOverview': PlayerOverview,
  },
  props: {
    game: Object,
    carrier: Object
  },
  data () {
    return {
      currentPlayerId: this.getUserPlayer()._id,
      showAction: true
    }
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.game, this.$store.state.userId)
    },
    getCarrierOwningPlayer () {
      return GameHelper.getCarrierOwningPlayer(this.game, this.carrier.data)
    },
    getCarrierOrbitingStar () {
      return GameHelper.getCarrierOrbitingStar(this.game, this.carrier.data)
    },
    toggleShowAction (e) {
      this.showAction = !this.showAction

      e.preventDefault()
    }
  }
}
</script>

<style scoped>
</style>
