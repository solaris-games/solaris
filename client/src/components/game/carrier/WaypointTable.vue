<template>
<div class="table-responsive">
    <table class="table table-striped table-hover mb-1">
        <thead>
            <tr class="bg-primary">
                <td>Delay</td>
                <td>Destination</td>
                <td v-if="!showAction">
                  <a href="javascript:;" @click="toggleShowAction">ETA</a>
                </td>
                <td v-if="showAction">
                  <a href="javascript:;" @click="toggleShowAction">Action</a>
                </td>
                <td class="text-right">
                  <a href="javascript:;" v-if="!$isHistoricalMode() && canEditWaypoints" @click="onEditWaypointsRequested">
                    <i class="fas fa-pencil-alt"></i>
                  </a>
                </td>
            </tr>
        </thead>
        <tbody>
            <waypointRow v-for="waypoint in carrier.waypoints" v-bind:key="waypoint._id"
                        :carrier="carrier"
                        :waypoint="waypoint" :showAction="showAction"
                        :showEdit="!carrier.isGift"
                        @onEditWaypointRequested="onEditWaypointRequested"
                        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
        </tbody>
    </table>
</div>
</template>

<script>
import WaypointRow from './WaypointRow'
import GameHelper from '../../../services/gameHelper'

export default {
  components: {
    'waypointRow': WaypointRow
  },
  props: {
    carrier: Object
  },
  data () {
    return {
      showAction: true
    }
  },
  methods: {
    toggleShowAction (e) {
      this.showAction = !this.showAction
    },
    onEditWaypointRequested (e) {
      this.$emit('onEditWaypointRequested', e)
    },
    onEditWaypointsRequested (e) {
      this.$emit('onEditWaypointsRequested', e)
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    }
  },
  computed: {
    canEditWaypoints: function () {
      return !this.carrier.isGift && !GameHelper.isGameFinished(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
</style>
