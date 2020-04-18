<template>
<div class="container">
    <!-- TODO: These need to act off the carrier object itself instead of pixi object -->
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

      <div v-if="carrier.data.waypoints.length" class="row pt-0 pb-0 mb-0">
        <waypointTable :game="game" :carrier="carrier" :isEditingWaypoints="isEditingWaypoints"/>
      </div>

      <div v-if="carrier.data.waypoints.length" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p class="mb-2">Looping: {{carrier.data.waypointsLooped ? 'Enabled' : 'Disabled'}}</p>
        </div>
        <div class="col-4 mb-2" v-if="isEditingWaypoints">
          <button class="btn btn-block btn-success" v-if="!carrier.data.waypointsLooped" @click="toggleWaypointsLooped()">Enable</button>
          <button class="btn btn-block btn-danger" v-if="carrier.data.waypointsLooped" @click="toggleWaypointsLooped()">Disable</button>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p v-if="carrier.data.waypoints.length" class="mb-2">ETA: 0d 0h 0m 0s (0h 0m 0s)</p>
        </div>
        <div class="col-4 mb-2" v-if="!isEditingWaypoints">
          <button class="btn btn-block btn-success" @click="editWaypoints()">Edit Waypoints</button>
        </div>
        <div class="col-4 mb-2" v-if="isEditingWaypoints">
          <button class="btn btn-danger" @click="removeLastWaypoint()"><i class="fas fa-minus"></i></button>
          <button class="btn btn-danger ml-1" @click="removeAllWaypoints()"><i class="fas fa-times"></i></button>
          <button class="btn btn-success ml-1" @click="saveWaypoints()"><i class="fas fa-check"></i></button>
        </div>
      </div>
    </div>
    
    <playerOverview v-if="getCarrierOwningPlayer()" :game="game" :player="getCarrierOwningPlayer()" />
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import CarrierApiService from '../../../services/api/carrier'
import PlayerOverview from '../player/Overview'
import GameContainer from '../../../game/container'
import WaypointTable from './WaypointTable'

export default {
  components: {
    'playerOverview': PlayerOverview,
    'waypointTable': WaypointTable
  },
  props: {
    game: Object,
    carrier: Object
  },
  data () {
    return {
      currentPlayerId: this.getUserPlayer()._id,
      isEditingWaypoints: false
    }
  },
  mounted () {
    GameContainer.map.on('onWaypointCreated', this.onWaypointCreated.bind(this))
  },
  methods: {
    // TODO: This method appears everywhere, is there a way to make it global?
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.game)
    },
    getCarrierOwningPlayer () {
      return GameHelper.getCarrierOwningPlayer(this.game, this.carrier.data)
    },
    getCarrierOrbitingStar () {
      return GameHelper.getCarrierOrbitingStar(this.game, this.carrier.data)
    },
    toggleWaypointsLooped () {
      // TODO: Verify that the last waypoint is within hyperspace range of the first waypoint.
      this.carrier.data.waypointsLooped = !this.carrier.data.waypointsLooped
    },
    editWaypoints () {
      this.isEditingWaypoints = true

      GameContainer.map.setMode('waypoints', this.carrier.data)
    },
    onWaypointCreated (e) {
      // this.carrier.data.waypoints.push(e)
    },
    removeLastWaypoint () {
      // If the carrier is not currently in transit to the waypoint
      // then remove it.
      let lastWaypoint = this.carrier.data.waypoints[this.carrier.data.waypoints.length - 1]

      if (!GameHelper.isCarrierInTransitToWaypoint(this.carrier.data, lastWaypoint)) {
        this.carrier.data.waypoints.splice(this.carrier.data.waypoints.indexOf(lastWaypoint), 1)

        GameContainer.map.draw()
      }
    },
    removeAllWaypoints () {
      // Remove all waypoints up to the last waypoint (if in transit)
      this.carrier.data.waypoints = this.carrier.data.waypoints.filter(w => GameHelper.isCarrierInTransitToWaypoint(this.carrier.data, w))

      GameContainer.map.draw()
    },
    async saveWaypoints () {
      // Push the waypoints to the API.
      try {
        let result = await CarrierApiService.saveWaypoints(this.game._id, this.carrier.data._id, this.carrier.data.waypoints)

        // TODO: Do something with the response...?
        if (result.status === 200) {
          this.isEditingWaypoints = false
        }
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>

<style scoped>
</style>
