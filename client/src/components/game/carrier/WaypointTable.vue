<template>
<div class="table-responsive">
    <table class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>Delay</td>
                <td>Destination</td>
                <td v-if="!showAction">ETA</td>
                <td v-if="showAction">Action</td>
                <td class="text-right">
                  <a href="javascript:;" @click="toggleShowAction">Show {{showAction ? 'Action' : 'ETA'}}</a>
                </td>
            </tr>
        </thead>
        <tbody>
            <waypointRow v-for="waypoint in carrier.waypoints" v-bind:key="waypoint._id"
                        :waypoint="waypoint" :showAction="showAction"
                        @onEditWaypointRequested="onEditWaypointRequested"/>
        </tbody>
    </table>
</div>
</template>

<script>
import WaypointRow from './WaypointRow'

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
    }
  }
}
</script>

<style scoped>
</style>
