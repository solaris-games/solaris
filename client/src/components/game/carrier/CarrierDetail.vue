<template>
<div class="menu-page container" v-if="carrier">
    <menu-title :title="carrier.name" @onCloseRequested="onCloseRequested">
      <button @click="viewOnMap" class="btn btn-info"><i class="fas fa-eye"></i></button>
    </menu-title>

    <div class="row bg-secondary">
      <div class="col text-center pt-3">
        <p v-if="isUserPlayerCarrier">A carrier under your command.</p>
        <p v-if="isNotUserPlayerCarrier">This carrier is controlled by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{carrierOwningPlayer.alias}}</a>.</p>
        <p v-if="carrier.isGift" class="text-warning">This carrier is a gift.</p>
      </div>
    </div>

    <!-- TODO: This should be a component -->
    <div class="row mb-0 pt-3 pb-3 bg-primary">
        <div class="col">
            Ships
        </div>
        <div class="col text-right">
            {{carrier.ships == null ? '???' : carrier.ships}} <i class="fas fa-rocket ml-1"></i>
        </div>
    </div>

    <h4 class="pt-2">Navigation</h4>

    <div class="mt-2">
      <div v-if="carrier.orbiting" class="row bg-secondary pt-2 pb-0 mb-0">
        <div class="col-7">
          <p class="mb-2 align-middle">Orbiting: <a href="javascript:;" @click="onOpenOrbitingStarDetailRequested">{{getCarrierOrbitingStar().name}}</a></p>
        </div>
        <div class="col-5">
          <button class="btn btn-block btn-primary mb-2" @click="onShipTransferRequested" v-if="userPlayer && carrierOwningPlayer == userPlayer && carrier && !carrier.isGift && !userPlayer.defeated">Ship Transfer</button>
        </div>
      </div>

      <div v-if="!carrier.waypoints.length" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col">
          <p class="mb-2">Waypoints: None.</p>
        </div>
      </div>

      <div v-if="carrier.waypoints.length && carrierOwningPlayer == userPlayer" class="row pt-0 pb-0 mb-0">
        <waypointTable :carrier="carrier" @onEditWaypointRequested="onEditWaypointRequested"
          @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      </div>

      <div v-if="carrier.waypoints.length && carrierOwningPlayer != userPlayer" class="row mb-0 pt-2 pb-3">
        <div class="col">
            Destination
        </div>
        <div class="col text-right">
          <a href="javascript:;" @click="onOpenFirstWaypointStarDetailRequested">{{getFirstWaypointDestination().name}}</a> <i class="fas fa-map-marker-alt ml-2"></i>
        </div>
      </div>

      <div v-if="userPlayer && carrierOwningPlayer == userPlayer && !userPlayer.defeated && carrier.waypoints.length && carrier && !carrier.isGift" class="row bg-primary pt-2 pb-0 mb-0">
        <div class="col-8">
          <p class="mb-2">Looping: {{carrier.waypointsLooped ? 'Enabled' : 'Disabled'}}</p>
        </div>
        <div class="col-4 mb-2">
          <button class="btn btn-block btn-success" v-if="!carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">Enable</button>
          <button class="btn btn-block btn-danger" v-if="carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">Disable</button>
        </div>
      </div>

      <div class="row bg-secondary pt-2 pb-0 mb-0" v-if="carrier.waypoints.length || canEditWaypoints">
        <div :class="{'col-7':canEditWaypoints,'col':!canEditWaypoints}">
          <p v-if="carrier.waypoints.length" class="mb-2">ETA: {{timeRemainingEta}} <span v-if="carrier.waypoints.length > 1">({{timeRemainingEtaTotal}})</span></p>
        </div>
        <div class="mb-2 col-5" v-if="canEditWaypoints">
          <button class="btn btn-block btn-success" @click="editWaypoints()">Edit Waypoints</button>
        </div>
      </div>
    </div>

    <h4 class="pt-2" v-if="canShowSpecialist">Specialist</h4>

    <carrier-specialist v-if="canShowSpecialist" :carrierId="carrier._id" @onViewHireCarrierSpecialistRequested="onViewHireCarrierSpecialistRequested"/>

    <h4 class="pt-2" v-if="canGiftCarrier">Gift Carrier</h4>

    <gift-carrier v-if="canGiftCarrier" :carrierId="carrier._id"/>
<!-- 
    <playerOverview v-if="carrierOwningPlayer" :playerId="carrierOwningPlayer._id"
      @onViewConversationRequested="onViewConversationRequested"
      @onViewCompareIntelRequested="onViewCompareIntelRequested"/> -->
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import CarrierApiService from '../../../services/api/carrier'
import MenuTitle from '../MenuTitle'
import PlayerOverview from '../player/Overview'
import GameContainer from '../../../game/container'
import WaypointTable from './WaypointTable'
import CarrierSpecialistVue from './CarrierSpecialist'
import GiftCarrierVue from './GiftCarrier'

export default {
  components: {
    'menu-title': MenuTitle,
    'playerOverview': PlayerOverview,
    'waypointTable': WaypointTable,
    'carrier-specialist': CarrierSpecialistVue,
    'gift-carrier': GiftCarrierVue
  },
  props: {
    carrierId: String
  },
  data () {
    return {
      carrier: null,
      carrierOwningPlayer: null,
      userPlayer: null,
      isLoopingWaypoints: false,
      timeRemainingEta: null,
      timeRemainingEtaTotal: null,
      intervalFunction: null,
      onWaypointCreatedHandler: null,
      canShowSpecialist: false
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)
    this.carrierOwningPlayer = GameHelper.getCarrierOwningPlayer(this.$store.state.game, this.carrier)
    this.canShowSpecialist = this.$store.state.game.settings.specialGalaxy.specialistCost !== 'none' 
      && (this.carrier.specialistId || this.carrierOwningPlayer == this.userPlayer)

    this.onWaypointCreatedHandler = this.onWaypointCreated.bind(this)

    GameContainer.map.on('onWaypointCreated', this.onWaypointCreatedHandler)

    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
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
    onViewHireCarrierSpecialistRequested (e) {
      this.$emit('onViewHireCarrierSpecialistRequested', e)
    },
    getCarrierOrbitingStar () {
      return GameHelper.getCarrierOrbitingStar(this.$store.state.game, this.carrier)
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.carrierOwningPlayer._id)
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    onOpenFirstWaypointStarDetailRequested (e) {
      this.onOpenStarDetailRequested(this.getFirstWaypointDestination()._id)
    },
    viewOnMap (e) {
      GameContainer.map.panToCarrier(this.carrier)
    },
    getFirstWaypointDestination () {
      if (!this.carrier.waypoints.length) {
        return null
      }

      return GameHelper.getStarById(this.$store.state.game, this.carrier.waypoints[0].destination)
    },
    async toggleWaypointsLooped () {
      // TODO: Verify that the last waypoint is within hyperspace range of the first waypoint.
      try {
        this.isLoopingWaypoints = true
        let response = await CarrierApiService.loopWaypoints(this.$store.state.game._id, this.carrier._id, !this.carrier.waypointsLooped)

        if (response.status === 200) {
          this.$toasted.show(`${this.carrier.name} waypoints updated.`)

          this.carrier.waypointsLooped = !this.carrier.waypointsLooped

          GameContainer.reloadCarrier(this.carrier)
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoopingWaypoints = false
    },
    editWaypoints () {
      this.$emit('onEditWaypointsRequested', this.carrier._id)
    },
    onWaypointCreated (e) {
      // this.carrier.waypoints.push(e)
    },
    onShipTransferRequested (e) {
      if (this.carrier.orbiting) {
        this.$emit('onShipTransferRequested', this.carrier._id)
      }
    },
    onEditWaypointRequested (e) {
      this.$emit('onEditWaypointRequested', {
        carrierId: this.carrier._id,
        waypoint: e
      })
    },
    onOpenOrbitingStarDetailRequested (e) {
      this.onOpenStarDetailRequested(this.getCarrierOrbitingStar()._id)
    },
    recalculateTimeRemaining () {
      if (this.carrier.ticksEta) {
        this.timeRemainingEta = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.carrier.ticksEta)
      }

      if (this.carrier.ticksEtaTotal) {
        this.timeRemainingEtaTotal = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.carrier.ticksEtaTotal)
      }
    }
  },
  computed: {
    canGiftCarrier: function () {
      return this.$store.state.game.settings.specialGalaxy.giftCarriers === 'enabled' && this.isUserPlayerCarrier && !this.carrier.orbiting && !this.carrier.isGift
    },
    isUserPlayerCarrier: function () {
      return this.carrier && this.userPlayer && this.carrier.ownedByPlayerId == this.userPlayer._id
    },
    isNotUserPlayerCarrier: function () {
      return this.carrier && !this.userPlayer || this.carrier.ownedByPlayerId != this.userPlayer._id
    },
    canEditWaypoints: function () {
      return this.userPlayer && this.carrierOwningPlayer == this.userPlayer && this.carrier && !this.carrier.isGift && !this.userPlayer.defeated
    }
  }
}
</script>

<style scoped>
</style>
