<template>
	<div class="container">
    	<menu-title title="Edit Fleet Order" @onCloseRequested="onCloseRequested"/>

        <div class="row no-gutters mb-1">
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
                <span>Ships</span>
            </div>
        </div>

        <div class="row no-gutters mb-2" v-if="currentWaypoint">
            <div class="col-2 text-center">
                <input type="number" class="form-control input-sm" v-model="currentWaypoint.delayTicks">
            </div>
            <div class="col-3 text-center pt-1">
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
                </select>
            </div>
            <div class="col-2 text-center">
                <input v-if="isActionRequiresShips(currentWaypoint.action)" class="form-control input-sm" type="number" v-model="currentWaypoint.actionShips"/>
            </div>
        </div>

		<div class="row bg-secondary pt-2 pb-2">
			<div class="col-8">
				<button class="btn btn-primary" @click="previousWaypoint()" :disabled="isSavingWaypoints"><i class="fas fa-chevron-left"></i></button>
				<button class="btn btn-primary ml-1" @click="nextWaypoint()" :disabled="isSavingWaypoints"><i class="fas fa-chevron-right"></i></button>
			</div>
			<div class="col-4">
				<button class="btn btn-success btn-block" @click="saveWaypoints()" :disabled="isSavingWaypoints">Save</button>
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
        carrier: Object,
        waypoint: Object
    },
    data () {
        return {
            isSavingWaypoints: false,
            currentWaypoint: null,
            waypoints: []
        }
    },
    mounted () {
        // Make a copy of the carriers waypoints.
        this.waypoints = JSON.parse(JSON.stringify(this.carrier.waypoints))
        this.currentWaypoint = this.waypoints.find(x => x._id === this.waypoint._id)
        this.zoomToWaypoint()
    },
	methods: {
		onCloseRequested (e) {
			this.$emit('onCloseRequested', e)
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
                    return 'Collect All Ships'
                case 'dropAll':
                    return 'Drop All Ships'
                case 'collect':
                    return `Collect ${waypoint.actionShips} Ships`
                case 'drop':
                    return `Drop ${waypoint.actionShips} Ships`
                case 'collectAllBut':
                    return `Collect All But ${waypoint.actionShips} Ships`
                case 'dropAllBut':
                    return `Drop All But ${waypoint.actionShips} Ships`
                case 'garrison':
                    return `Garrison ${waypoint.actionShips} Ships`
            }
        },
        isActionRequiresShips (action) {
            switch (action) {
                case 'collect':
                case 'drop':
                case 'collectAllBut':
                case 'dropAllBut':
                case 'garrison':
                    return true
            }

            return false
        },
        previousWaypoint () {
            let index = this.waypoints.indexOf(this.currentWaypoint)

            index--

            if (index < 0) {
                index = this.waypoints.length - 1
            }

            this.currentWaypoint = this.waypoints[index]
            this.zoomToWaypoint()
        },
        nextWaypoint () {
            let index = this.waypoints.indexOf(this.currentWaypoint)

            index++

            if (index > this.waypoints.length - 1) {
                index = 0
            }

            this.currentWaypoint = this.waypoints[index]
            this.zoomToWaypoint()
        },
        zoomToWaypoint () {
            let star = this.$store.state.game.galaxy.stars.find(x => x._id === this.currentWaypoint.destination)

            GameContainer.map.zoomToLocation(star.location)
        },
		async saveWaypoints (saveAndEdit = false) {
			// Push the waypoints to the API.
			try {
                this.isSavingWaypoints = true
				let response = await CarrierApiService.saveWaypoints(this.$store.state.game._id, this.carrier._id, this.waypoints)

				if (response.status === 200) {
                    this.carrier.waypoints = this.waypoints
                    
                    this.$emit('onOpenCarrierDetailRequested', this.carrier)
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
