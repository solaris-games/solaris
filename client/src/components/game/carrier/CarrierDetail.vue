<template>
<div class="container">
    <menu-title :title="carrier.name" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="carrier.ownedByPlayerId == currentPlayerId">A carrier under your command.<br/>Give it orders to capture more stars!</p>
        <p v-if="carrier.ownedByPlayerId != null && carrier.ownedByPlayerId != currentPlayerId">This carrier is controlled by <a href="" @click="onOpenPlayerDetailRequested">{{getCarrierOwningPlayer().alias}}</a>.</p>
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
          <p class="mb-2 align-middle">Orbiting: <a href="" @click="onOpenStarDetailRequested">{{getCarrierOrbitingStar().name}}</a></p>
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
        <waypointTable :game="game" :carrier="carrier" @onEditWaypointRequested="onEditWaypointRequested"/>
      </div>

      <!-- <div v-if="carrier.waypoints.length" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p class="mb-2">Looping: {{carrier.waypointsLooped ? 'Enabled' : 'Disabled'}}</p>
        </div>
        <div class="col-4 mb-2">
          <button class="btn btn-block btn-success" v-if="!carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">Enable</button>
          <button class="btn btn-block btn-danger" v-if="carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">Disable</button>
        </div>
      </div> -->

      <div class="row bg-secondary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p v-if="carrier.waypoints.length" class="mb-2">ETA: {{timeRemainingEta}} ({{timeRemainingEtaTotal}})</p>
        </div>
        <div class="col-4 mb-2">
          <button class="btn btn-block btn-success" @click="editWaypoints()">Edit Waypoints</button>
        </div>
      </div>
    </div>
    
    <playerOverview v-if="getCarrierOwningPlayer()" :game="game" :player="getCarrierOwningPlayer()" @onViewConversationRequested="onViewConversationRequested"/>
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
      isLoopingWaypoints: false,
      timeRemainingEta: null,
      timeRemainingEtaTotal: null,
      intervalFunction: null
    }
  },
  mounted () {
    GameContainer.map.on('onWaypointCreated', this.onWaypointCreated.bind(this))

    this.recalculateTimeRemaining()

    if (!this.game.state.paused) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 100)
    }
  },
  destroyed () {
    clearInterval(this.intervalFunction)
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', e)
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
    onOpenPlayerDetailRequested (e) {
      e.preventDefault()

      this.$emit('onOpenPlayerDetailRequested', this.getCarrierOwningPlayer())
    },
    async toggleWaypointsLooped () {
      // TODO: Verify that the last waypoint is within hyperspace range of the first waypoint.
      try {
        this.isLoopingWaypoints = true
        let response = await CarrierApiService.loopWaypoints(this.game._id, this.carrier._id, !this.carrier.waypointsLooped)

        if (response.status === 200) {
          this.carrier.waypointsLooped = !this.carrier.waypointsLooped
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoopingWaypoints = false
    },
    editWaypoints () {
      this.$emit('onEditWaypointsRequested', this.carrier)
    },
    onWaypointCreated (e) {
      // this.carrier.waypoints.push(e)
    },
    onShipTransferRequested (e) {
      this.$emit('onShipTransferRequested', {
        star: GameHelper.getStarById(this.game, this.carrier.orbiting),
        carrier: this.carrier
      })
    },
    onEditWaypointRequested (e) {
      this.$emit('onEditWaypointRequested', {
        carrier: this.carrier,
        waypoint: e
      })
    },
    onOpenStarDetailRequested (e) {
      e.preventDefault()

      this.$emit('onOpenStarDetailRequested', this.getCarrierOrbitingStar())
    },
    recalculateTimeRemaining () {
      this.timeRemainingEta = GameHelper.getCountdownTimeString(this.carrier.eta)
      this.timeRemainingEtaTotal = GameHelper.getCountdownTimeString(this.carrier.etaTotal)
    }
  }
}
</script>

<style scoped>
</style>
