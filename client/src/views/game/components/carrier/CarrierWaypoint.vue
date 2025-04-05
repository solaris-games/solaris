<template>
	<div class="menu-page container" v-if="carrier">
    	<menu-title title="Edit Fleet Order" @onCloseRequested="onCloseRequested"/>

        <div class="row g-0 mb-1">
            <div class="col-2 text-center">
                <span>Delay</span>
            </div>
            <div class="col-3 text-center">
                <span>Destination</span>
            </div>
            <div class="col-5 text-center">
                <span>Action</span>
            </div>
            <div class="col-2 text-center">
                <span v-if="!currentWaypoint || !currentWaypoint.action || !isActionRequiresPercentage(currentWaypoint.action)">Ships</span>
                <span v-if="currentWaypoint && currentWaypoint.action && isActionRequiresPercentage(currentWaypoint.action)">%</span>
            </div>
        </div>

        <div class="row g-0 mb-2" v-if="currentWaypoint">
            <div class="col-2 text-center">
              <input type="number" class="form-control input-sm" v-if="!(isFirstWaypoint(currentWaypoint) && isInTransit)" v-model="currentWaypoint.delayTicks" @change="recalculateWaypointDuration">
            </div>
            <div class="col-3 text-center pt-1">
                <!-- <a href="javascript:;" @click="onOpenStarDetailRequested">{{getStarName(currentWaypoint.destination)}}</a> -->
                <span>{{getStarName(currentWaypoint.destination)}}</span>
            </div>
            <div class="col-5 text-center">
                <select class="form-control input-sm" id="waypointAction" v-model="currentWaypoint.action">
                    <option key="nothing" value="nothing">{{getWaypointActionFriendlyText(currentWaypoint, 'nothing')}}</option>
                    <option key="collectAll" value="collectAll">{{getWaypointActionFriendlyText(currentWaypoint, 'collectAll')}}</option>
                    <option key="dropAll" value="dropAll">{{getWaypointActionFriendlyText(currentWaypoint, 'dropAll')}}</option>
                    <option key="collect" value="collect">{{getWaypointActionFriendlyText(currentWaypoint, 'collect')}}</option>
                    <option key="drop" value="drop">{{getWaypointActionFriendlyText(currentWaypoint, 'drop')}}</option>
                    <option key="collectAllBut" value="collectAllBut">{{getWaypointActionFriendlyText(currentWaypoint, 'collectAllBut')}}</option>
                    <option key="dropAllBut" value="dropAllBut">{{getWaypointActionFriendlyText(currentWaypoint, 'dropAllBut')}}</option>
                    <option key="garrison" value="garrison">{{getWaypointActionFriendlyText(currentWaypoint, 'garrison')}}</option>
                    <option key="collectPercentage" value="collectPercentage">{{getWaypointActionFriendlyText(currentWaypoint, 'collectPercentage')}}</option>
                    <option key="dropPercentage" value="dropPercentage">{{getWaypointActionFriendlyText(currentWaypoint, 'dropPercentage')}}</option>
                </select>
            </div>
            <div class="col-2 text-center">
                <input v-if="isActionRequiresShips(currentWaypoint.action)" class="form-control input-sm" type="number" v-model="currentWaypoint.actionShips"/>
            </div>
        </div>

        <div class="row pt-2 pb-0 mb-0">
          <div class="col">
            <p class="mb-2">ETA<orbital-mechanics-eta-warning />: {{waypointEta}}</p>
          </div>
          <div class="col-auto" v-if="isRealTimeGame">
            <p class="mb-2">Duration<orbital-mechanics-eta-warning />: {{waypointDuration}}</p>
          </div>
        </div>

		<div class="row bg-dark pt-2 pb-2">
			<div class="col pe-0">
				<button class="btn btn-sm btn-primary" @click="previousWaypoint()" :disabled="isSavingWaypoints">
          <i class="fas fa-chevron-left"></i>
          <span class="ms-1">Prev</span>
        </button>
				<button class="btn btn-sm btn-primary ms-1" @click="nextWaypoint()" :disabled="isSavingWaypoints">
          <span class="me-1">Next</span>
          <i class="fas fa-chevron-right"></i>
        </button>
				<button class="btn btn-sm ms-1" :class="{'btn-success':carrier.waypointsLooped,'btn-outline-primary':!carrier.waypointsLooped}" @click="toggleLooped()" :disabled="$isHistoricalMode() || !canLoop" title="Loop/Unloop the carrier's waypoints">
          <i class="fas fa-sync"></i>
        </button>
			</div>
			<div class="col-auto" v-if="!$isHistoricalMode()">
				<button class="btn btn-sm btn-outline-success" @click="saveWaypoints()" :disabled="isSavingWaypoints">
          <i class="fas fa-save"></i>
          <span class="ms-1">Save</span>
        </button>
				<button class="btn btn-sm btn-success ms-1" @click="saveWaypoints(true)" :disabled="isSavingWaypoints">
          <i class="fas fa-check"></i>
          <span class="ms-1 d-none d-sm-inline-block">Save &amp; Edit</span>
        </button>
			</div>
		</div>
	</div>
</template>

<script>
import MenuTitle from '../MenuTitle.vue'
import GameHelper from '../../../../services/gameHelper'
import GameContainer from '../../../../game/container'
  import CarrierApiService from '../../../../services/api/carrier'
  import AudioService from '../../../../game/audio'
import OrbitalMechanicsETAWarningVue from '../shared/OrbitalMechanicsETAWarning.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "../../../../eventBusEventNames/mapCommand";
import gameHelper from "../../../../services/gameHelper";

export default {
  components: {
    'menu-title': MenuTitle,
    'orbital-mechanics-eta-warning': OrbitalMechanicsETAWarningVue
  },
  props: {
    carrierId: String,
    waypoint: Object
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
      userPlayer: null,
      carrier: null,
      isSavingWaypoints: false,
      currentWaypoint: null,
      waypoints: [],
      waypointDuration: null,
      waypointEta: null
    }
  },
  mounted () {
    this.userPlayer = GameHelper.getUserPlayer(this.$store.state.game)
    this.carrier = GameHelper.getCarrierById(this.$store.state.game, this.carrierId)

    // Make a copy of the carriers waypoints.
    this.waypoints = JSON.parse(JSON.stringify(this.carrier.waypoints))
    this.currentWaypoint = this.waypoints.find(x => x._id === this.waypoint._id)
    this.recalculateWaypointDuration()
    this.recalculateWaypointEta()
    this.panToWaypoint()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateWaypointEta, 250)
      this.recalculateWaypointEta()
    }
  },
  unmounted () {
    this.eventBus.emit(MapCommandEventBusEventNames.MapCommandClearHighlightedLocations, {});
  },
  methods: {
    onCloseRequested (e) {
      this.$emit('onCloseRequested', e)
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.currentWaypoint.destination)
    },
    getStarName (starId) {
      return this.$store.state.game.galaxy.stars.find(s => s._id === starId).name
    },
    getWaypointActionFriendlyText (waypoint, action) {
      action = action || waypoint.action

      switch (action) {
        case 'nothing':
          return 'Do Nothing'
        case 'collectAll':
          return 'Collect All'
        case 'dropAll':
          return 'Drop All'
        case 'collect':
          return `Collect ${waypoint.actionShips}`
        case 'drop':
          return `Drop ${waypoint.actionShips}`
        case 'collectAllBut':
          return `Collect All But ${waypoint.actionShips}`
        case 'dropAllBut':
          return `Drop All But ${waypoint.actionShips}`
        case 'garrison':
          return `Garrison ${waypoint.actionShips}`
        case 'dropPercentage':
          return `Drop ${waypoint.actionShips}%`
        case 'collectPercentage':
          return `Collect ${waypoint.actionShips}%`
      }
    },
    isActionRequiresShips (action) {
      switch (action) {
        case 'collect':
        case 'drop':
        case 'collectAllBut':
        case 'dropAllBut':
        case 'collectPercentage':
        case 'dropPercentage':
        case 'garrison':
          return true
      }

      return false
    },
    isActionRequiresPercentage (action) {
      return action === 'dropPercentage' || action === 'collectPercentage';
    },
    previousWaypoint () {
      let index = this.waypoints.indexOf(this.currentWaypoint)

      index--

      if (index < 0) {
        index = this.waypoints.length - 1
      }

      this.currentWaypoint = this.waypoints[index]
      this.recalculateWaypointDuration()
      this.panToWaypoint()
    },
    nextWaypoint () {
      let index = this.waypoints.indexOf(this.currentWaypoint)

      index++

      if (index > this.waypoints.length - 1) {
        index = 0
      }

      this.currentWaypoint = this.waypoints[index]
      this.recalculateWaypointDuration()
      this.panToWaypoint()
    },
    panToWaypoint () {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandClearHighlightedLocations, {});

      const star = gameHelper.getStarById(this.$store.state.game, this.currentWaypoint.destination);

      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star });
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandHighlightLocation, { location: star.location });
    },
    toggleLooped () {
      this.carrier.waypointsLooped = !this.carrier.waypointsLooped
    },
    async saveWaypoints (saveAndEdit = false) {
      // Push the waypoints to the API.
      try {
        this.isSavingWaypoints = true
        const response = await CarrierApiService.saveWaypoints(this.$store.state.game._id, this.carrier._id, this.waypoints, this.carrier.waypointsLooped)

        if (response.status === 200) {
          AudioService.join()

          this.carrier.ticksEta = response.data.ticksEta
          this.carrier.ticksEtaTotal = response.data.ticksEtaTotal
          this.carrier.waypoints = response.data.waypoints

          this.$toast.default(`${this.carrier.name} waypoints updated.`)

          GameContainer.reloadCarrier(this.carrier);

          if (saveAndEdit) {
            this.$emit('onOpenCarrierDetailRequested', this.carrier._id)
          } else {
            this.onCloseRequested()
          }
        }
      } catch (e) {
        console.error(e)
      }

      this.isSavingWaypoints = false
    },
    recalculateWaypointDuration () {
      if (this.currentWaypoint) {
        const timeRemainingEtaDate = GameHelper.calculateTimeByTicks(this.currentWaypoint.ticks + +this.currentWaypoint.delayTicks, this.$store.state.game.settings.gameTime.speed, null)
        this.waypointDuration = GameHelper.getCountdownTimeString(this.$store.state.game, timeRemainingEtaDate, true)
      }

      this.recalculateWaypointEta()
    },
    recalculateWaypointEta () {
      // Calculate the ticks + delay up to and including the current waypoint.
      let index = this.waypoints.indexOf(this.currentWaypoint)
      let totalTicks = 0;

      for (let i = 0; i <= index; i++) {
        let wp = this.waypoints[i]

        // wp.ticks includes delayTicks
        totalTicks += wp.ticks
      }

      this.waypointEta = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, totalTicks)
    },
    isFirstWaypoint (waypoint) {
      return this.waypoints.indexOf(waypoint) === 0
    }
  },
  computed: {
    canLoop () {
      return GameHelper.canLoop(this.$store.state.game, this.userPlayer, this.carrier)
    },
    isInTransit () {
      return !this.carrier.orbiting
    },
    isRealTimeGame () {
      return GameHelper.isRealTimeGame(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
