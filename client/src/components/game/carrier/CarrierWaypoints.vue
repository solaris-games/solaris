<template>
	<div class="container">
    	<menu-title :title="carrier.name" @onCloseRequested="onCloseRequested"/>

		<p>
			Waypoints: {{getWaypointsString()}}
		</p>

		<div class="row bg-secondary pt-2 pb-2">
			<div class="col">
				<p>ETA: 0d 0h 0m 0s</p>
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
		game: Object,
		carrier: Object
	},
	mounted () {
		GameContainer.map.setMode('waypoints', this.carrier)
	},
	destroyed () {
		GameContainer.map.resetMode()
	},
	data () {
		return {
			isSavingWaypoints: false
		}
	},
	methods: {
		onCloseRequested (e) {
			this.$emit('onCloseRequested', e)
		},
		getStarName (starId) {
			return this.game.galaxy.stars.find(s => s._id === starId).name
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
		},
		removeAllWaypoints () {
			// Remove all waypoints up to the last waypoint (if in transit)
			this.carrier.waypoints = this.carrier.waypoints.filter(w => GameHelper.isCarrierInTransitToWaypoint(this.carrier, w))

			GameContainer.map.draw()
		},
		async saveWaypoints (saveAndEdit = false) {
			// Push the waypoints to the API.
			try {
				this.isSavingWaypoints = true
				let response = await CarrierApiService.saveWaypoints(this.game._id, this.carrier._id, this.carrier.waypoints)

				// TODO: Do something with the response...?
				if (response.status === 200) {
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
</style>
