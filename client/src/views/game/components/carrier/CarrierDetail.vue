<template>
<div class="menu-page container" v-if="carrier">
    <menu-title :title="carrier.name" @onCloseRequested="onCloseRequested">
      <button v-if="hasWaypoints" @click="onViewCombatCalculatorRequested" class="btn btn-sm btn-outline-warning"><i class="fas fa-calculator"></i></button>
      <modalButton modalName="scuttleCarrierModal" v-if="!$isHistoricalMode() && canScuttleCarrier" classText="btn btn-sm btn-outline-danger ms-1">
        <i class="fas fa-rocket"></i> <i class="fas fa-trash ms-1"></i>
      </modalButton>
      <button v-if="!$isHistoricalMode() && isOwnedByUserPlayer" @click="onCarrierRenameRequested" class="btn btn-sm btn-outline-success ms-1"><i class="fas fa-pencil-alt"></i></button>
      <button @click="viewOnMap" class="btn btn-sm btn-outline-info ms-1"><i class="fas fa-eye"></i></button>
    </menu-title>

    <div class="row bg-dark" :class="{'bg-warning': carrier.isGift}">
      <div class="col text-center pt-2">
        <p class="mb-2 text-info">
          Location: {{formatLocation(carrier.location)}}
          <help-tooltip v-if="isGameDarkMode" tooltip="Coordinates are scrambled because this is a dark mode game."/>
        </p>
        <p class="mb-2" v-if="isUserPlayerCarrier && !carrier.isGift">A carrier under your command.</p>
        <p class="mb-2" v-if="isNotUserPlayerCarrier">This carrier is controlled by <a href="javascript:;" @click="onOpenPlayerDetailRequested">{{carrierOwningPlayer.alias}}</a>.</p>
        <p class="mb-2" v-if="carrier.isGift"><strong>This carrier is a gift.</strong></p>
        <p class="mb-2" v-if="carrier.isGift"><small>When the carrier arrives at another player's star, it will transfer ownership.</small></p>
      </div>
    </div>

    <div v-if="isCompactUIStyle">
      <div class="row mt-2">
        <div class="col">
          <span title="The carrier is in orbit" v-if="carrier.orbiting">
            <i class="fas fa-star me-2"></i>
            <a href="javascript:;" @click="onOpenOrbitingStarDetailRequested">{{getCarrierOrbitingStar().name}}</a>
          </span>
          <span title="The carrier is in transit" v-if="!carrier.orbiting">
            <i class="fas fa-star me-2"></i>
            <a title="The carrier is in transit from this star" href="javascript:;" @click="onOpenSourceStarDetailRequested">{{getFirstWaypointSourceName()}}</a>
            <i class="fas fa-arrow-right me-2 ms-2"></i>
            <a title="The carrier is in transit to star" href="javascript:;" @click="onOpenDestinationStarDetailRequested">{{getFirstWaypointDestinationName()}}</a>
          </span>
        </div>
        <div class="col-auto">
          <span title="The weapons level of this carrier">
            {{carrier.effectiveTechs.weapons}} <i class="fas fa-gun ms-1"></i>
          </span>
        </div>
        <div class="col-auto">
          <span title="The total number of ships the carrier has">
            {{carrier.ships == null ? '???' : carrier.ships}} <i class="fas fa-rocket"></i>
          </span>
        </div>
      </div>

      <div class="row pb-2">
        <div class="col">
          <span v-if="canShowSpecialist && isOwnedByUserPlayer && canHireSpecialist">
            <specialist-icon :type="'carrier'" :defaultIcon="'user-astronaut'" :specialist="carrier.specialist"></specialist-icon>
            <a href="javascript:;" @click="onViewHireCarrierSpecialistRequested">
              <span class="ms-1" v-if="carrier.specialistId" :title="carrier.specialist.description">{{carrier.specialist.name}}</span>
              <span v-if="!carrier.specialistId">No Specialist</span>
            </a>
            <span v-if="carrier.specialistId && carrier.specialistExpireTick" class="badge bg-warning ms-1"><i class="fas fa-stopwatch"></i> Expires Tick {{carrier.specialistExpireTick}}</span>
          </span>
          <span v-if="canShowSpecialist && (!isOwnedByUserPlayer || !canHireSpecialist)">
            <specialist-icon :type="'carrier'" :defaultIcon="'user-astronaut'" :specialist="carrier.specialist"></specialist-icon>
            <span v-if="carrier.specialist" class="ms-1">{{carrier.specialist.name}}</span>
            <span v-if="carrier.specialistId && carrier.specialistExpireTick" class="badge bg-warning ms-1"><i class="fas fa-stopwatch"></i> Expires Tick {{carrier.specialistExpireTick}}</span>
            <span v-if="!carrier.specialist">No Specialist</span>
          </span>
        </div>
        <div class="col-auto">
          <span title="The hyperspace range of this carrier">
            {{carrier.effectiveTechs.hyperspace}} <i class="fas fa-gas-pump ms-1"></i>
          </span>
        </div>
        <div class="col-auto">
          <span title="The total number of waypoints the carrier has - Plot waypoints to capture stars">
            {{carrier.waypoints.length}}
            <i class="fas fa-map-marker-alt ms-1" v-if="!carrier.waypointsLooped"></i>
            <i class="fas fa-sync ms-1" v-if="carrier.waypointsLooped"></i>
          </span>
        </div>
      </div>

      <div class="row pb-2" v-if="carrier.specialist">
        <div class="col">
          <p class="mb-0"><small>{{carrier.specialist.description}}</small></p>
        </div>
      </div>

      <div class="row pb-2 pt-2 " v-if="!$isHistoricalMode() && (canGiftCarrier || canTransferShips || canEditWaypoints)">
        <div class="col">
          <button class="btn btn-sm btn-primary me-1" @click="onShipTransferRequested" v-if="canTransferShips">
            Transfer <i class="fas fa-exchange-alt"></i>
          </button>
          <button class="btn btn-sm btn-warning" @click="onConfirmGiftCarrier" v-if="canGiftCarrier">
            Gift <i class="fas fa-gift"></i>
          </button>
        </div>
        <div class="col-auto">
          <button class="btn btn-outline-success btn-sm" v-if="canEditWaypoints && carrier.waypoints.length > 1 && !carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Loop
            <i class="fas fa-sync"></i>
          </button>
          <button class="btn btn-danger btn-sm ms-1" v-if="canEditWaypoints && carrier.waypoints.length > 1 && carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Unloop
            <i class="fas fa-map-marker-alt"></i>
          </button>
          <button class="btn btn-sm btn-success ms-1" v-if="canEditWaypoints" @click="editWaypoints()">
            Waypoints
            <i class="fas fa-map-marker-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-if="isStandardUIStyle" class="mb-2">
      <!-- TODO: This should be a component -->
      <div class="row mb-0 pt-2 pb-2 bg-primary">
          <div class="col">
              Ships
          </div>
          <div class="col text-end">
              {{carrier.ships == null ? '???' : carrier.ships}} <i class="fas fa-rocket ms-1"></i>
          </div>
      </div>
      <div class="row mb-0 pt-1 pb-1">
          <div class="col">
              Weapons
          </div>
          <div class="col text-end">
              {{carrier.effectiveTechs.weapons}} <i class="fas fa-gun ms-1"></i>
          </div>
      </div>
      <div class="row mb-0 pt-1 pb-1 bg-dark">
          <div class="col">
              Hyperspace Range
          </div>
          <div class="col text-end">
              {{carrier.effectiveTechs.hyperspace}} <i class="fas fa-gas-pump ms-1"></i>
          </div>
      </div>
    </div>

    <h4 class="pt-0" v-if="isStandardUIStyle">Navigation</h4>

    <div>
      <div v-if="carrier.orbiting && isStandardUIStyle" class="row bg-dark pt-2 pb-0 mb-1">
        <div class="col">
          <p class="mb-2 align-middle">Orbiting: <a href="javascript:;" @click="onOpenOrbitingStarDetailRequested">{{getCarrierOrbitingStar().name}}</a></p>
        </div>
        <div class="col-auto" v-if="!$isHistoricalMode() && isStarOwnedByUserPlayer">
          <button class="btn btn-sm btn-outline-primary mb-2" @click="onShipTransferRequested" v-if="canTransferShips">
            <i class="fas fa-exchange-alt"></i> Ship Transfer
          </button>
        </div>
      </div>

      <div v-if="isStandardUIStyle && !hasWaypoints" class="row pt-2 pb-2 mb-0">
        <div class="col">
          <p class="mb-0">Waypoints: None.</p>
        </div>
      </div>

      <div v-if="(hasWaypoints && isStandardUIStyle) || (hasWaypoints && isUserPlayerCarrier)" class="row pt-0 pb-0 mb-0">
        <waypointTable :carrier="carrier"
          @onEditWaypointRequested="onEditWaypointRequested"
          @onEditWaypointsRequested="editWaypoints"
          @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
      </div>

      <div class="row pt-2 pb-0 mb-0" v-if="hasWaypoints">
        <div class="col">
          <p class="mb-2">ETA<orbital-mechanics-eta-warning />: {{timeRemainingEta}} <span v-if="carrier.waypoints.length > 1">({{timeRemainingEtaTotal}})</span></p>
        </div>
      </div>

      <div v-if="!$isHistoricalMode() && canEditWaypoints && isStandardUIStyle" class="row bg-dark pt-2 pb-2 mb-0">
        <div class="col">
          <button class="btn btn-sm btn-outline-success" v-if="carrier.waypoints.length > 1 && !carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Loop
            <i class="fas fa-sync"></i>
          </button>
          <button class="btn btn-sm btn-danger" v-if="carrier.waypoints.length > 1 && carrier.waypointsLooped" @click="toggleWaypointsLooped()" :disabled="isLoopingWaypoints">
            Unloop
            <i class="fas fa-map-marker-alt"></i>
          </button>
          <!-- <p class="mb-2">Looping: {{carrier.waypointsLooped ? 'Enabled' : 'Disabled'}}</p> -->
        </div>
        <div class="col-auto">
          <button class="btn btn-sm btn-success" @click="editWaypoints()">
            Edit Waypoints
            <i class="fas fa-map-marker-alt"></i>
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

    <!-- Modals -->
    <dialogModal modalName="scuttleCarrierModal" titleText="Scuttle Carrier" cancelText="No" confirmText="Yes" @onConfirm="confirmScuttleCarrier">
      <p>Are you sure you want to scuttle <b>{{carrier.name}}</b>?</p>
    </dialogModal>
</div>
</template>

<script>
import { inject } from 'vue';
import GameHelper from '../../../../services/gameHelper'
import CarrierApiService from '../../../../services/api/carrier'
import MenuTitle from '../MenuTitle.vue'
import GameContainer from '../../../../game/container'
import WaypointTable from './WaypointTable.vue'
import CarrierSpecialistVue from './CarrierSpecialist.vue'
import GiftCarrierVue from './GiftCarrier.vue'
import SpecialistIconVue from '../specialist/SpecialistIcon.vue'
import ModalButton from '../../../components/modal/ModalButton.vue'
import DialogModal from '../../../components/modal/DialogModal.vue'
import AudioService from '../../../../game/audio'
import OrbitalMechanicsETAWarningVue from '../shared/OrbitalMechanicsETAWarning.vue'
import HelpTooltip from '../../../components/HelpTooltip.vue'
import {formatLocation} from "client/src/util/format";
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import GameCommandEventBusEventNames from "@/eventBusEventNames/gameCommand";

export default {
  components: {
    'menu-title': MenuTitle,
    'waypointTable': WaypointTable,
    'carrier-specialist': CarrierSpecialistVue,
    'gift-carrier': GiftCarrierVue,
    'specialist-icon': SpecialistIconVue,
    'modalButton': ModalButton,
    'dialogModal': DialogModal,
    'orbital-mechanics-eta-warning': OrbitalMechanicsETAWarningVue,
    'help-tooltip': HelpTooltip,
  },
  props: {
    carrierId: String
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
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

    this.eventBus.on('onWaypointCreated', this.onWaypointCreatedHandler)

    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 250)
      this.recalculateTimeRemaining()
    }
  },
  unmounted () {
    this.eventBus.off('onWaypointCreated', this.onWaypointCreatedHandler)

    clearInterval(this.intervalFunction)
  },
  methods: {
    formatLocation,
    onCloseRequested (e) {
      GameContainer.unselectAllCarriers()

      this.$emit('onCloseRequested', e)
    },
    onViewCompareIntelRequested (e) {
      this.$emit('onViewCompareIntelRequested', e)
    },
    onCarrierRenameRequested (e) {
      this.$emit('onCarrierRenameRequested', this.carrier._id)
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
    onViewCombatCalculatorRequested (e) {
      this.$emit('onViewCarrierCombatCalculatorRequested', this.carrier._id)
    },
    viewOnMap (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: this.carrier });
    },
    getFirstWaypointSource () {
      if (!this.carrier.waypoints.length) {
        return null
      }

      return GameHelper.getStarById(this.$store.state.game, this.carrier.waypoints[0].source)
    },
    getFirstWaypointSourceName () {
      let source = this.getFirstWaypointSource()

      return source ? source.name : 'Unknown'
    },
    getFirstWaypointDestination () {
      if (!this.carrier.waypoints.length) {
        return null
      }

      return GameHelper.getStarById(this.$store.state.game, this.carrier.waypoints[0].destination)
    },
    getFirstWaypointDestinationName () {
      let destination = this.getFirstWaypointDestination()

      return destination ? destination.name : 'Unknown'
    },
    async toggleWaypointsLooped () {
      // TODO: Verify that the last waypoint is within hyperspace range of the first waypoint.
      try {
        this.isLoopingWaypoints = true
        const response = await CarrierApiService.loopWaypoints(this.$store.state.game._id, this.carrier._id, !this.carrier.waypointsLooped)

        if (response.status === 200) {
          this.$toast.default(`${this.carrier.name} waypoints updated.`)

          this.carrier.waypointsLooped = !this.carrier.waypointsLooped

          this.eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: this.carrier });
        }
      } catch (err) {
        console.error(err)
      }

      this.isLoopingWaypoints = false
    },
    async onConfirmGiftCarrier (e) {
      if (!await this.$confirm('Gift a carrier', `Are you sure you want to convert ${this.carrier.name} into a gift? If the carrier has a specialist, and the destination star does not belong to an ally, then it will be retired when it arrives at the destination.`)) {
        return
      }

      this.isGiftingCarrier = true

      try {
        const response = await CarrierApiService.convertToGift(this.$store.state.game._id, this.carrierId)

        if (response.status === 200) {
          // TODO: Maybe better to come from the server instead of repeating
          // server side logic and client side logic?
          this.carrier.isGift = true
          this.carrier.waypointsLooped = false;

          const firstWaypoint = this.carrier.waypoints[0];

          firstWaypoint.action = 'nothing';
          firstWaypoint.actionShips = 0;
          firstWaypoint.delayTicks = 0;

          this.carrier.waypoints = [firstWaypoint];

          this.eventBus.emit(GameCommandEventBusEventNames.GameCommandReloadCarrier, { carrier: this.carrier });

          this.$toast.default(`${this.carrier.name} has been converted into a gift.`)
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
      const star = this.getFirstWaypointSource()

      if (star) {
        this.onOpenStarDetailRequested(this.carrier.waypoints[0].source)
      }
    },
    onOpenDestinationStarDetailRequested (e) {
      const star = this.getFirstWaypointDestination()

      if (star) {
        this.onOpenStarDetailRequested(this.carrier.waypoints[0].destination)
      }
    },
    recalculateTimeRemaining () {
      if (this.carrier.ticksEta) {
        this.timeRemainingEta = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.carrier.ticksEta)
      }

      if (this.carrier.ticksEtaTotal) {
        this.timeRemainingEtaTotal = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.carrier.ticksEtaTotal)
      }
    },
    async confirmScuttleCarrier (e) {
      try {
        const response = await CarrierApiService.scuttle(this.$store.state.game._id, this.carrier._id)

        if (response.status === 200) {
          this.$toast.default(`${this.carrier.name} has been scuttled. All ships will be destroyed.`)

          this.$store.commit('gameCarrierScuttled', {
            carrierId: this.carrier._id
          })

          AudioService.leave()

          this.onCloseRequested()
        }
      } catch (err) {
        console.error(err)
      }
    }
  },
  computed: {
    canGiftCarrier: function () {
      return this.$store.state.game.settings.specialGalaxy.giftCarriers === 'enabled'
        && this.isUserPlayerCarrier
        && !this.carrier.isGift
        && !this.userPlayer.defeated
        && !GameHelper.isGameFinished(this.$store.state.game)
    },
    canScuttleCarrier: function () {
      return this.isOwnedByUserPlayer && !this.userPlayer.defeated && this.isGameInProgress && !this.carrier.isGift
    },
    isUserPlayerCarrier: function () {
      return this.carrier && this.userPlayer && this.carrier.ownedByPlayerId == this.userPlayer._id
    },
    isNotUserPlayerCarrier: function () {
      return (this.carrier && !this.userPlayer) || (this.carrier.ownedByPlayerId != this.userPlayer._id)
    },
    hasWaypoints: function () {
      return this.carrier.waypoints && this.carrier.waypoints.length
    },
    canEditWaypoints: function () {
      return this.userPlayer && this.carrierOwningPlayer == this.userPlayer && this.carrier && !this.userPlayer.defeated && !this.carrier.isGift && !GameHelper.isGameFinished(this.$store.state.game)
    },
    canTransferShips: function () {
      return this.isUserPlayerCarrier && this.carrier.orbiting && !this.userPlayer.defeated && !GameHelper.isGameFinished(this.$store.state.game)
    },
    canShowSpecialist: function () {
      return this.$store.state.game.settings.specialGalaxy.specialistCost !== 'none' && (this.carrier.specialistId || this.isUserPlayerCarrier)
    },
    canHireSpecialist: function () {
      return this.canShowSpecialist
        && this.carrier.orbiting
        && this.isStarOwnedByUserPlayer
        && !GameHelper.isGameFinished(this.$store.state.game)
        && !this.isDeadStar
        && (!this.carrier.specialistId || !this.carrier.specialist.oneShot)
    },
    isOwnedByUserPlayer: function () {
      const owner = GameHelper.getCarrierOwningPlayer(this.$store.state.game, this.carrier)

      return owner && this.userPlayer && owner._id === this.userPlayer._id
    },
    isStarOwnedByUserPlayer: function () {
      const owner = GameHelper.getStarOwningPlayer(this.$store.state.game, this.getCarrierOrbitingStar())

      return owner && this.userPlayer && owner._id === this.userPlayer._id
    },
    isDeadStar: function () {
      return GameHelper.isDeadStar(this.getCarrierOrbitingStar())
    },
    isGameInProgress () {
      return GameHelper.isGameInProgress(this.$store.state.game)
    },
    isGameDarkMode () {
      return GameHelper.isDarkMode(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
