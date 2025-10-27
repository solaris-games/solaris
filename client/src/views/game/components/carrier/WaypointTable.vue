<template>
<div class="table-responsive p-0">
    <table class="table table-striped table-hover mb-1">
        <thead class="table-dark">
            <tr>
                <td v-if="userPlayerOwnsCarrier">Delay</td>
                <td>Destination</td>
                <td v-if="!showAction" title="Show actions">
                  <a class="link-inactive" href="javascript:;" @click="toggleShowAction">
                    [&nbsp;ETA&nbsp;|&nbsp;<span class="link-active">Action</span>&nbsp;]
                  </a>
                </td>
                <td v-if="showAction" title="Show ETAs">
                  <a class="link-inactive" href="javascript:;" @click="toggleShowAction">
                    [&nbsp;<span class="link-active">ETA</span>&nbsp;|&nbsp;Action&nbsp;]
                  </a>
                </td>
                <td class="text-end" v-if="!$isHistoricalMode() && canEditWaypoints">
                  <a href="javascript:;" @click="onEditWaypointsRequested">
                    Edit
                  </a>
                </td>
            </tr>
        </thead>
        <tbody>
            <waypointRow v-for="waypoint in carrier.waypoints" v-bind:key="waypoint._id"
                        :carrier="carrier"
                        :waypoint="waypoint" :showAction="showAction"
                        @onEditWaypointRequested="onEditWaypointRequested"
                        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
        </tbody>
    </table>
</div>
</template>

<script>
import WaypointRow from './WaypointRow.vue'
import GameHelper from '../../../../services/gameHelper'

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
    userPlayer() {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    userPlayerOwnsCarrier: function () {
      return this.userPlayer &&
        GameHelper.getCarrierOwningPlayer(this.$store.state.game, this.carrier)._id === this.userPlayer._id
    },
    canEditWaypoints: function () {
      return !GameHelper.isGameFinished(this.$store.state.game) && this.userPlayerOwnsCarrier && !this.carrier.isGift
    }
  }
}
</script>

<style scoped>
.link-inactive {
  text-decoration: none;
  color: inherit;
}

.link-active {
  text-decoration: underline;
  color: var(--bs-theme);
}
</style>
