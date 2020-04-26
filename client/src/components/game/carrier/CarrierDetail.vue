<template>
<div class="container">
    <menu-title :title="carrier.name" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="carrier.ownedByPlayerId == currentPlayerId">A carrier under your command.<br/>Give it orders to capture more stars!</p>
        <p v-if="carrier.ownedByPlayerId != null && carrier.ownedByPlayerId != currentPlayerId">This carrier is controlled by [{{getCarrierOwningPlayer().alias}}].</p>
      </div>
    </div>

    <!-- TODO: This should be a component -->
    <div v-if="carrier.ships" class="row mb-0 pt-3 pb-3 bg-primary">
        <div class="col">
            Ships
        </div>
        <div class="col text-right">
            {{carrier.ships}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <h4 class="pt-2">Navigation</h4>

    <div v-if="getCarrierOwningPlayer() == getUserPlayer()" class="mt-2">
      <div v-if="carrier.orbiting" class="row bg-secondary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p class="mb-2 align-middle">Orbiting: <a href="">{{getCarrierOrbitingStar().name}}</a></p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary mb-2" @click="onShipTransferRequested">Ship Transfer</button>
        </div>
      </div>

      <div v-if="!carrier.waypoints.length" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col">
          <p class="mb-2">Waypoints: None.</p>
        </div>
      </div>

      <div v-if="carrier.waypoints.length" class="row pt-0 pb-0 mb-0">
        <waypointTable :game="game" :carrier="carrier" :isEditingWaypoints="isEditingWaypoints"/>
      </div>

      <div v-if="carrier.waypoints.length" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p class="mb-2">Looping: {{carrier.waypointsLooped ? 'Enabled' : 'Disabled'}}</p>
        </div>
        <div class="col-4 mb-2" v-if="isEditingWaypoints">
          <button class="btn btn-block btn-success" v-if="!carrier.waypointsLooped" @click="toggleWaypointsLooped()">Enable</button>
          <button class="btn btn-block btn-danger" v-if="carrier.waypointsLooped" @click="toggleWaypointsLooped()">Disable</button>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p v-if="carrier.waypoints.length" class="mb-2">ETA: 0d 0h 0m 0s (0h 0m 0s)</p>
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
import MenuTitle from '../MenuTitle'
import PlayerOverview from '../player/Overview'
import GameContainer from '../../../game/container'
import WaypointTable from './WaypointTable'

export default {
  components: {
    'menu-title': MenuTitle,
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
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    // TODO: This method appears everywhere, is there a way to make it global?
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.game)
    },
    getCarrierOwningPlayer () {
      return GameHelper.getCarrierOwningPlayer(this.game, this.carrier)
    },
    getCarrierOrbitingStar () {
      return GameHelper.getCarrierOrbitingStar(this.game, this.carrier)
    },
    toggleWaypointsLooped () {
      // TODO: Verify that the last waypoint is within hyperspace range of the first waypoint.
      this.carrier.waypointsLooped = !this.carrier.waypointsLooped
    },
    editWaypoints () {
      this.isEditingWaypoints = true

      GameContainer.map.setMode('waypoints', this.carrier)
    },
    onWaypointCreated (e) {
      // this.carrier.waypoints.push(e)
    },
    removeLastWaypoint () {
      // If the carrier is not currently in transit to the waypoint
      // then remove it.
      let lastWaypoint = this.carrier.waypoints[this.carrier.waypoints.length - 1]

      if (!GameHelper.isCarrierInTransitToWaypoint(this.carrier, lastWaypoint)) {
        this.carrier.waypoints.splice(this.carrier.waypoints.indexOf(lastWaypoint), 1)

        GameContainer.map.draw()
      }
    },
    removeAllWaypoints () {
      // Remove all waypoints up to the last waypoint (if in transit)
      this.carrier.waypoints = this.carrier.waypoints.filter(w => GameHelper.isCarrierInTransitToWaypoint(this.carrier, w))

      GameContainer.map.draw()
    },
    async saveWaypoints () {
      // Push the waypoints to the API.
      try {
        let response = await CarrierApiService.saveWaypoints(this.game._id, this.carrier._id, this.carrier.waypoints)

        // TODO: Do something with the response...?
        if (response.status === 200) {
          this.isEditingWaypoints = false
        }
      } catch (e) {
        console.error(e)
      }
    },
    onShipTransferRequested (e) {
      this.$emit('onShipTransferRequested', {
        star: GameHelper.getStarById(this.game, this.carrier.orbiting),
        carrier: this.carrier
      })
    }
  }
}
</script>

<style scoped>
</style>
