<template>
	<div class="container">
    	<menu-title :title="carrier.name" @onCloseRequested="onCloseRequested"/>

		Waypoints:
		<ul class="pl-4 mt-2">
			<li v-for="waypoint in carrier.waypoints" :key="waypoint._id">
				{{getStarName(waypoint.destination)}}

				<i class="ml-2" :class="{
					'fas fa-angle-double-up text-success': waypoint.action == 'collectAll',
					'fas fa-angle-double-down text-danger': waypoint.action == 'dropAll',
					'fas fa-caret-up text-success': waypoint.action == 'collect',
					'fas fa-caret-down text-danger': waypoint.action == 'drop',
					'fas fa-angle-up text-success': waypoint.action == 'collectAllBut',
					'fas fa-angle-down text-danger': waypoint.action == 'dropAllBut',
					'fas fa-star text-warning': waypoint.action == 'garrison'
				}"></i> 
				<span v-if="waypoint.actionShips"> {{waypoint.actionShips}}</span>
			</li>
		</ul>

		<div class="row bg-secondary pt-2 pb-2">
			<div class="col">
				<p v-if="totalEtaTimeString">ETA: {{totalEtaTimeString}}</p>
			</div>
			<div class="col-auto">
				<button class="btn btn-danger" @click="removeLastWaypoint()" :disabled="isSavingWaypoints"><i class="fas fa-minus"></i></button>
				<button class="btn btn-danger ml-1" @click="removeAllWaypoints()" :disabled="isSavingWaypoints"><i class="fas fa-times"></i></button>
				<button class="btn btn-success ml-1" @click="saveWaypoints()" :disabled="isSavingWaypoints">Save</button>
				<button class="btn btn-success ml-1" @click="saveWaypoints(true)" :disabled="isSavingWaypoints">Save &amp; Edit</button>
			</div>
		</div>
	</div>
</template>

<script>
import MenuTitle from '../MenuTitle'
import GameHelper from '../../../services/gameHelper'
import GameContainer from '../../../game/container'
import CarrierApiService from '../../../services/api/carrier'

export default {
	components: {
    	'menu-title': MenuTitle,
	},
	props: {
		carrier: Object
	},
	mounted () {
		GameContainer.map.setMode('waypoints', this.carrier)

		this.waypointCreatedHandler = this.onWaypointCreated.bind(this);
    	GameContainer.map.on('onWaypointCreated', this.waypointCreatedHandler)

		this.oldWaypoints = this.carrier.waypoints.slice(0)
	},
	destroyed () {
		GameContainer.map.resetMode()

		GameContainer.map.off('onWaypointCreated', this.waypointCreatedHandler)
	},
	data () {
		return {
			isSavingWaypoints: false,
			oldWaypoints: [],
			totalEtaTimeString: null,
			waypointCreatedHandler: null
		}
	},
	methods: {
		onCloseRequested (e) {
			this.carrier.waypoints = this.oldWaypoints

			this.$emit('onCloseRequested', e)
		},
		getStarName (starId) {
			return this.$store.state.game.galaxy.stars.find(s => s._id === starId).name
		},
		getWaypointsString () {
			if (!this.carrier.waypoints.length) {
				return 'None'
			}

			return this.carrier.waypoints.map(w => this.getStarName(w.destination)).join(', ')
		},
		removeLastWaypoint () {
			// If the carrier is not currently in transit to the waypoint
			// then remove it.
			let lastWaypoint = this.carrier.waypoints[this.carrier.waypoints.length - 1]

			if (!GameHelper.isCarrierInTransitToWaypoint(this.carrier, lastWaypoint)) {
				this.carrier.waypoints.splice(this.carrier.waypoints.indexOf(lastWaypoint), 1)

				GameContainer.map.draw()
			}

			if (!this.carrier.waypoints.length) {
				this.totalEtaTimeString = null
			}
		},
		removeAllWaypoints () {
			// Remove all waypoints up to the last waypoint (if in transit)
			this.carrier.waypoints = this.carrier.waypoints.filter(w => GameHelper.isCarrierInTransitToWaypoint(this.carrier, w))

			GameContainer.map.draw()

			this.totalEtaTimeString = null
		},
		onWaypointCreated () {
			let totalTicksEta = GameHelper.calculateWaypointTicksEta(this.$store.state.game, this.carrier, 
				this.carrier.waypoints[this.carrier.waypoints.length - 1])

			let totalEtaTime = GameHelper.calculateTimeByTicks(totalTicksEta, 
				this.$store.state.game.settings.gameTime.speed, this.$store.state.game.state.lastTickDate)

			this.totalEtaTimeString = GameHelper.getCountdownTimeString(this.$store.state.game, totalEtaTime.toDate())
		},
		async saveWaypoints (saveAndEdit = false) {
			// Push the waypoints to the API.
			try {
				this.isSavingWaypoints = true
				let response = await CarrierApiService.saveWaypoints(this.$store.state.game._id, this.carrier._id, this.carrier.waypoints)

				if (response.status === 200) {
					this.oldWaypoints = this.carrier.waypoints

					if (saveAndEdit) {
						this.$emit('onOpenCarrierDetailRequested', this.carrier)
					} else {
						this.onCloseRequested()
					}

				}
			} catch (e) {
				console.error(e)
			}

			this.isSavingWaypoints = false
		}
	}
}
</script>

<style scoped>
li {
	list-style-type: none;
}
</style>
