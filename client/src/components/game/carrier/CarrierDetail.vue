<template>
<div class="menu-page container" v-if="carrier">
    <menu-title :title="carrier.name" @onCloseRequested="onCloseRequested">
      <button @click="viewOnMap" class="btn btn-sm btn-info"><i class="fas fa-eye"></i></button>
    </menu-title>

    <div class="row bg-secondary">
      <div class="col text-center pt-2">
        <p class="mb-2" v-if="isUserPlayerCarrier">A carrier under your command.</p>
        <p class="mb-2" v-if="isNotUserPlayerCarrier">This carrier is controlled by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{carrierOwningPlayer.alias}}</a>.</p>
        <p class="mb-2 text-warning" v-if="carrier.isGift">This carrier is a gift.</p>
      </div>
    </div>

    <div v-if="isCompactUIStyle">
      <div class="row mt-2">
        <div class="col">
          <span title="Orbiting" v-if="carrier.orbiting">
            <i class="fas fa-star mr-2"></i>
            <a href="javascript:;" @click="onOpenOrbitingStarDetailRequested">{{getCarrierOrbitingStar().name}}</a>
          </span>
          <span title="In Transit" v-if="!carrier.orbiting">
            <a title="Source Star" href="javascript:;" @click="onOpenSourceStarDetailRequested">{{getFirstWaypointSource().name}}</a>
            <i class="fas fa-arrow-right mr-2 ml-2"></i>
            <a title="Destination Star" href="javascript:;" @click="onOpenDestinationStarDetailRequested">{{getFirstWaypointDestination().name}}</a>
          </span>
        </div>
        <div class="col-auto">
          <span title="Ships">
            {{carrier.ships == null ? '???' : carrier.ships}} <i class="fas fa-rocket ml-1"></i>
          </span>
        </div>
      </div>

      <div class="row pb-2">
        <div class="col">
          <span v-if="canShowSpecialist && isOwnedByUserPlayer && canHireSpecialist">
            <specialist-icon :type="'carrier'" :defaultIcon="'user-astronaut'" :specialist="carrier.specialist"></specialist-icon>
            <a href="javascript:;" @click="onViewHireCarrierSpecialistRequested">
              <span class="ml-1" v-if="carrier.specialistId" :title="carrier.specialist.description">{{carrier.specialist.name}}</span>
              <span v-if="!carrier.specialistId">No Specialist</span>
            </a>
          </span>
          <span v-if="canShowSpecialist && (!isOwnedByUserPlayer || !canHireSpecialist)">
            <specialist-icon :type="'carrier'" :defaultIcon="'user-astronaut'" :specialist="carrier.specialist"></specialist-icon>
            <span v-if="carrier.specialist">
              {{carrier.specialist.name}}
            </span>
            <span v-if="!carrier.specialist">
              No Specialist
            </span>
          </span>
        </div>
        <div class="col-auto">
          <span title="Waypoints">
            {{carrier.waypoints.length}} 
            <i class="fas fa-map-marker-alt ml-1" v-if="!carrier.waypointsLooped"></i>
            <i class="fas fa-sync ml-1" v-if="carrier.waypointsLooped"></i>
          </span>
        </div>
      </div>

      <div class="row pb-2" v-if="carrier.specialist">
        <div class="col">
          <p class="mb-0"><small>{{carrier.specialist.description}}</small></p>
        </div>
      </div>

      <div class="row pb-2 pt-2 bg-secondary" v-if="canGiftCarrier || canTransferShips || canEditWaypoints">
        <div class="col">
          <button class="btn btn-sm btn-primary" @click="onShipTransferRequested" v-if="canTransferShips">
            Transfer <i class="fas fa-exchange-alt"></i>
          </button>
          <button class="btn btn-sm btn-warning" @click="onConfirmGiftCarrier" v-if="canGiftCarrier">
            Gift <i class="fas fa-gift"></i>
          </button>
        </div>
        <div class="col-auto">
          <button class="btn btn-success btn-sm" v-if="canEditWaypoints && carrier.waypoints.length > 1 && !carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Loop
            <i class="fas fa-sync"></i>
          </button>
          <button class="btn btn-danger  btn-sm ml-1" v-if="canEditWaypoints && carrier.waypoints.length > 1 && carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Unloop
            <i class="fas fa-map-marker-alt"></i>
          </button>
          <button class="btn btn-sm btn-success ml-1" v-if="canEditWaypoints" @click="editWaypoints()">
            Waypoints
            <i class="fas fa-pencil-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isStandardUIStyle" class="mb-2">
      <!-- TODO: This should be a component -->
      <div class="row mb-0 pt-3 pb-3 bg-primary">
          <div class="col">
              Ships
          </div>
          <div class="col text-right">
              {{carrier.ships == null ? '???' : carrier.ships}} <i class="fas fa-rocket ml-1"></i>
          </div>
      </div>
    </div>

    <h4 class="pt-0" v-if="isStandardUIStyle">Navigation</h4>

    <div>
      <div v-if="carrier.orbiting && isStandardUIStyle" class="row bg-secondary pt-2 pb-0 mb-0">
        <div class="col">
          <p class="mb-2 align-middle">Orbiting: <a href="javascript:;" @click="onOpenOrbitingStarDetailRequested">{{getCarrierOrbitingStar().name}}</a></p>
        </div>
        <div class="col-auto">
          <button class="btn btn-sm btn-primary mb-2" @click="onShipTransferRequested" v-if="canTransferShips">
            <i class="fas fa-exchange-alt"></i> Ship Transfer
          </button>
        </div>
      </div>

      <div v-if="isStandardUIStyle && !carrier.waypoints.length" class="row bg-primary pt-2 pb-2 mb-0">
        <div class="col">
          <p class="mb-0">Waypoints: None.</p>
        </div>
      </div>

      <div v-if="carrier.waypoints.length && carrierOwningPlayer == userPlayer" class="row pt-0 pb-0 mb-0">
        <waypointTable :carrier="carrier" 
          @onEditWaypointRequested="onEditWaypointRequested"
          @onEditWaypointsRequested="editWaypoints"
          @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      </div>

      <div class="row bg-primary pt-2 pb-0 mb-0" v-if="carrier.waypoints.length">
        <div class="col">
          <p v-if="carrier.waypoints.length" class="mb-2">ETA: {{timeRemainingEta}} <span v-if="carrier.waypoints.length > 1">({{timeRemainingEtaTotal}})</span></p>
        </div>
      </div>

      <div v-if="canEditWaypoints && isStandardUIStyle" class="row bg-secondary pt-2 pb-2 mb-0">
        <div class="col">
          <button class="btn btn-success" :class="{'btn-sm':isCompactUIStyle}" v-if="carrier.waypoints.length > 1 && !carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Loop
            <i class="fas fa-sync"></i>
          </button>
          <button class="btn btn-danger" :class="{'btn-sm':isCompactUIStyle}" v-if="carrier.waypoints.length > 1 && carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Unloop
            <i class="fas fa-map-marker-alt"></i>
          </button>
          <!-- <p class="mb-2">Looping: {{carrier.waypointsLooped ? 'Enabled' : 'Disabled'}}</p> -->
        </div>
        <div class="col-auto">
          <button class="btn btn-sm btn-success" @click="editWaypoints()">
            Edit Waypoints
            <i class="fas fa-pencil-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isStandardUIStyle">
      <h4 class="pt-2" v-if="canShowSpecialist">Specialist</h4>

      <carrier-specialist v-if="canShowSpecialist" :carrierId="carrier._id" @onViewHireCarrierSpecialistRequested="onViewHireCarrierSpecialistRequested"/>
    </div>

    <div v-if="isStandardUIStyle">
      <h4 class="pt-2" v-if="canGiftCarrier">Gift Carrier</h4>

      <gift-carrier v-if="canGiftCarrier" :carrierId="carrier._id"/>
    </div>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import CarrierApiService from '../../../services/api/carrier'
import MenuTitle from '../MenuTitle'
import GameContainer from '../../../game/container'
import WaypointTable from './WaypointTable'
import CarrierSpecialistVue from './CarrierSpecialist'
import GiftCarrierVue from './GiftCarrier'
import SpecialistIconVue from '../specialist/SpecialistIcon'

export default {
  components: {
    'menu-title': MenuTitle,
    'waypointTable': WaypointTable,
    'carrier-specialist': CarrierSpecialistVue,
    'gift-carrier': GiftCarrierVue,
    'specialist-icon': SpecialistIconVue
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
      isGiftingCarrier: false,
      timeRemainingEta: null,
      timeRemainingEtaTotal: null,
      intervalFunction: null,
      onWaypointCreatedHandler: null,
      isStandardUIStyle: false,
      isCompactUIStyle: false
    }
  },
  mounted () {
    this.isStandardUIStyle = this.$store.state.settings.interface.uiStyle === 'standard'
    this.isCompactUIStyle = this.$store.state.settings.interface.uiStyle === 'compact'

    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)
    this.carrierOwningPlayer = GameHelper.getCarrierOwningPlayer(this.$store.state.game, this.carrier)

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
      this.$emit('onViewHireCarrierSpecialistRequested', this.carrier._id)
    },
    getCarrierOrbitingStar () {
      return GameHelper.getCarrierOrbitingStar(this.$store.state.game, this.carrier)
    },
    getCarrierSourceStar () {
      return this.getFirstWaypointSource()
    },
    getCarrierDestinationStar () {
      return this.getFirstWaypointDestination()
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
    getFirstWaypointSource () {
      if (!this.carrier.waypoints.length) {
        return null
      }

      return GameHelper.getStarById(this.$store.state.game, this.carrier.waypoints[0].source)
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
    async onConfirmGiftCarrier (e) {
      if (!confirm(`Are you sure you want to convert ${this.carrier.name} into a gift?`)) {
        return
      }

      this.isGiftingCarrier = true

      try {
        let response = await CarrierApiService.convertToGift(this.$store.state.game._id, this.carrierId)

        if (response.status === 200) {
          // TODO: Maybe better to come from the server instead of repeating
          // server side logic and client side logic?
          this.carrier.isGift = true
          this.carrier.waypointsLooped = false;

          let firstWaypoint = this.carrier.waypoints[0];

          firstWaypoint.action = 'nothing';
          firstWaypoint.actionShips = 0;
          firstWaypoint.delayTicks = 0;

          this.carrier.waypoints = [firstWaypoint];

          GameContainer.reloadCarrier(this.carrier)

          this.$toasted.show(`${this.carrier.name} has been converted into a gift.`)
        }
      } catch (err) {
        console.error(err)
      }

      this.isGiftingCarrier = false
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
    onOpenSourceStarDetailRequested (e) {
      this.onOpenStarDetailRequested(this.carrier.waypoints[0].source)
    },
    onOpenDestinationStarDetailRequested (e) {
      this.onOpenStarDetailRequested(this.carrier.waypoints[0].destination)
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
      return this.$store.state.game.settings.specialGalaxy.giftCarriers === 'enabled' && this.isUserPlayerCarrier && !this.carrier.orbiting && !this.carrier.isGift && !this.userPlayer.defeated && !GameHelper.isGameFinished(this.$store.state.game)
    },
    isUserPlayerCarrier: function () {
      return this.carrier && this.userPlayer && this.carrier.ownedByPlayerId == this.userPlayer._id
    },
    isNotUserPlayerCarrier: function () {
      return this.carrier && !this.userPlayer || this.carrier.ownedByPlayerId != this.userPlayer._id
    },
    canEditWaypoints: function () {
      return this.userPlayer && this.carrierOwningPlayer == this.userPlayer && this.carrier && !this.carrier.isGift && !this.userPlayer.defeated && !GameHelper.isGameFinished(this.$store.state.game)
    },
    canTransferShips: function () {
      return this.isUserPlayerCarrier && this.carrier.orbiting && !this.carrier.isGift && !this.userPlayer.defeated && !GameHelper.isGameFinished(this.$store.state.game)
    },
    canShowSpecialist: function () {
      return this.$store.state.game.settings.specialGalaxy.specialistCost !== 'none' && (this.carrier.specialistId || this.isUserPlayerCarrier)
    },
    canHireSpecialist: function () {
      return this.canShowSpecialist && this.carrier.orbiting && !GameHelper.isGameFinished(this.$store.state.game)
    },
    isOwnedByUserPlayer: function () {
      let owner = GameHelper.getCarrierOwningPlayer(this.$store.state.game, this.carrier)

      return owner && this.userPlayer && owner == this.userPlayer
    }
  }
}
</script>

<style scoped>
</style>
