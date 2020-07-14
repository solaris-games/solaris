<template>
<div class="container">
    <menu-title :title="carrier.name" @onCloseRequested="onCloseRequested"/>

    <div class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="carrier.ownedByPlayerId == currentPlayerId">A carrier under your command.<br/>Give it orders to capture more stars!</p>
        <p v-if="carrier.ownedByPlayerId != null && carrier.ownedByPlayerId != currentPlayerId">This carrier is controlled by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{getCarrierOwningPlayer().alias}}</a>.</p>
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
          <p class="mb-2 align-middle">Orbiting: <a href="javascript:;" @click="onOpenStarDetailRequested">{{getCarrierOrbitingStar().name}}</a></p>
        </div>
        <div class="col-4">
          <button class="btn btn-block btn-primary mb-2" @click="onShipTransferRequested" v-if="!getUserPlayer().defeated">Ship Transfer</button>
        </div>
      </div>

      <div v-if="!carrier.waypoints.length" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col">
          <p class="mb-2">Waypoints: None.</p>
        </div>
      </div>

      <div v-if="carrier.waypoints.length" class="row pt-0 pb-0 mb-0">
        <waypointTable :carrier="carrier" @onEditWaypointRequested="onEditWaypointRequested"/>
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
          <button class="btn btn-block btn-success" @click="editWaypoints()" v-if="!getUserPlayer().defeated">Edit Waypoints</button>
        </div>
      </div>
    </div>
    
    <playerOverview v-if="getCarrierOwningPlayer()" :player="getCarrierOwningPlayer()" 
      @onViewConversationRequested="onViewConversationRequested"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"/>
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
    carrier: Object
  },
  data () {
    return {
      currentPlayerId: this.getUserPlayer()._id,
      isLoopingWaypoints: false,
      timeRemainingEta: null,
      timeRemainingEtaTotal: null,
      intervalFunction: null,
      onWaypointCreatedHandler: null
    }
  },
  mounted () {
    this.onWaypointCreatedHandler = this.onWaypointCreated.bind(this)

    GameContainer.map.on('onWaypointCreated', this.onWaypointCreatedHandler)

    this.recalculateTimeRemaining()

    if (!this.$store.state.game.state.paused) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 100)
    }
  },
  destroyed () {
    GameContainer.map.off('onWaypointCreated', this.onWaypointCreatedHandler)
    
    clearInterval(this.intervalFunction)
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onViewConversationRequested (e) {
      this.$emit('onViewConversationRequested', e)
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', e)
    },
    // TODO: This method appears everywhere, is there a way to make it global?
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getCarrierOwningPlayer () {
      return GameHelper.getCarrierOwningPlayer(this.$store.state.game, this.carrier)
    },
    getCarrierOrbitingStar () {
      return GameHelper.getCarrierOrbitingStar(this.$store.state.game, this.carrier)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.getCarrierOwningPlayer()._id)
    },
    async toggleWaypointsLooped () {
      // TODO: Verify that the last waypoint is within hyperspace range of the first waypoint.
      try {
        this.isLoopingWaypoints = true
        let response = await CarrierApiService.loopWaypoints(this.$store.state.game._id, this.carrier._id, !this.carrier.waypointsLooped)

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
        star: GameHelper.getStarById(this.$store.state.game, this.carrier.orbiting),
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
      this.$emit('onOpenStarDetailRequested', this.getCarrierOrbitingStar()._id)
    },
    recalculateTimeRemaining () {
      let timeRemainingEtaDate = GameHelper.calculateTimeByTicks(this.carrier.ticksEta, 
        this.$store.state.game.settings.gameTime.speed, this.$store.state.game.state.lastTickDate)
      let timeRemainingEtaTotalDate = GameHelper.calculateTimeByTicks(this.carrier.ticksEtaTotal, 
        this.$store.state.game.settings.gameTime.speed, this.$store.state.game.state.lastTickDate)
        
      this.timeRemainingEta = GameHelper.getCountdownTimeString(this.$store.state.game, timeRemainingEtaDate)
      this.timeRemainingEtaTotal = GameHelper.getCountdownTimeString(this.$store.state.game, timeRemainingEtaTotalDate)
    }
  }
}
</script>

<style scoped>
</style>
