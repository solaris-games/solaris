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

        <div class="row no-gutters mb-2">
            <div class="col-2 text-center">
                <input type="number" class="form-control input-sm" v-model="waypoint.delayTicks">
            </div>
            <div class="col-3 text-center pt-1">
                <span>{{getStarName(waypoint.destination)}}</span>
            </div>
            <div class="col-5 text-center">
                <select class="form-control input-sm" id="waypointAction" v-model="waypoint.action">
                    <option key="nothing" value="nothing">{{getWaypointActionFriendlyText(waypoint, 'nothing')}}</option>
                    <option key="collectAll" value="collectAll">{{getWaypointActionFriendlyText(waypoint, 'collectAll')}}</option>
                    <option key="dropAll" value="dropAll">{{getWaypointActionFriendlyText(waypoint, 'dropAll')}}</option>
                    <option key="collect" value="collect">{{getWaypointActionFriendlyText(waypoint, 'collect')}}</option>
                    <option key="drop" value="drop">{{getWaypointActionFriendlyText(waypoint, 'drop')}}</option>
                    <option key="collectAllBut" value="collectAllBut">{{getWaypointActionFriendlyText(waypoint, 'collectAllBut')}}</option>
                    <option key="dropAllBut" value="dropAllBut">{{getWaypointActionFriendlyText(waypoint, 'dropAllBut')}}</option>
                    <option key="garrison" value="garrison">{{getWaypointActionFriendlyText(waypoint, 'garrison')}}</option>
                </select>
            </div>
            <div class="col-2 text-center">
                <input v-if="isActionRequiresShips(waypoint.action)" class="form-control input-sm" type="number" v-model="waypoint.actionShips"/>
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
            isSavingWaypoints: false
        }
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
            let index = this.carrier.waypoints.indexOf(this.waypoint)

            index--

            if (index < 0) {
                index = this.carrier.waypoints.length - 1
            }

            this.waypoint = this.carrier.waypoints[index]
        },
        nextWaypoint () {
            let index = this.carrier.waypoints.indexOf(this.waypoint)

            index++

            if (index > this.carrier.waypoints.length - 1) {
                index = 0
            }

            this.waypoint = this.carrier.waypoints[index]
        },
		async saveWaypoints (saveAndEdit = false) {
			// Push the waypoints to the API.
			try {
                this.isSavingWaypoints = true
				let response = await CarrierApiService.saveWaypoints(this.$store.state.game._id, this.carrier._id, this.carrier.waypoints)

				// TODO: Do something with the response...?
				if (response.status === 200) {
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
