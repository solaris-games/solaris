<template>
    <table class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>Delay</td>
                <td>Destination</td>
                <td v-if="!showAction">ETA</td>
                <td v-if="showAction">Action</td>
                <td class="text-right">
                  <a href="" @click="toggleShowAction">Show {{showAction ? 'Action' : 'ETA'}}</a>
                </td>
            </tr>
        </thead>
        <tbody>
            <waypointRow v-for="waypoint in carrier.data.waypoints" v-bind:key="waypoint"
                        :game="game" :waypoint="waypoint" :showAction="showAction"
                        :isEditingWaypoints="isEditingWaypoints"/>
        </tbody>
    </table>
</template>

<script>
import WaypointRow from './WaypointRow'

export default {
  components: {
    'waypointRow': WaypointRow
  },
  props: {
    game: Object,
    carrier: Object,
    isEditingWaypoints: Boolean
  },
  data () {
    return {
      showAction: true
    }
  },
  methods: {
    toggleShowAction (e) {
      this.showAction = !this.showAction

      e.preventDefault()
    }
  }
}
</script>

<style scoped>
</style>
