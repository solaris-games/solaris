<template>
    <tr>
        <td><span v-if="!(isFirstWaypoint(waypoint) && isInTransit)">{{waypoint.delayTicks}}</span></td>
        <td><a href="javascript:;" @click="onOpenStarDetailRequested">{{getStarName(waypoint.destination)}}</a></td>
        <td v-if="!showAction">{{timeRemainingEta}}</td>
        <td v-if="showAction">
            <span>{{getWaypointActionFriendlyText(waypoint)}}</span>
        </td>
        <td class="text-right">
          <a href="javascript:;" v-if="!$isHistoricalMode() && canEditWaypoints" @click="editWaypoint">Edit</a>
        </td>
    </tr>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    carrier: Object,
    waypoint: Object,
    showAction: Boolean
  },
  data () {
    return {
      timeRemainingEta: null
    }
  },
  mounted () {
    this.recalculateTimeRemaining()

    if (GameHelper.isGameInProgress(this.$store.state.game) || GameHelper.isGamePendingStart(this.$store.state.game)) {
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 1000)
      this.recalculateTimeRemaining()
    }
  },
  destroyed () {
    clearInterval(this.intervalFunction)
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.waypoint.destination)
    },
    getStarName (starId) {
      return this.$store.state.game.galaxy.stars.find(s => s._id === starId).name
    },
    editWaypoint (e) {
      this.$emit('onEditWaypointRequested', this.waypoint)
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
        case 'collectPercentage':
          return `Collect ${waypoint.actionShips}% Of Ships`
        case 'dropPercentage':
          return `Drop ${waypoint.actionShips}% Of Ships`
      }
    },
    recalculateTimeRemaining () {
      this.timeRemainingEta = GameHelper.getCountdownTimeStringByTicks(this.$store.state.game, this.waypoint.ticksEta)
    },
    isFirstWaypoint (waypoint) {
      return this.carrier.waypoints.indexOf(waypoint) === 0
    }
  },
  computed: {
    canEditWaypoints: function () {
      return !GameHelper.isGameFinished(this.$store.state.game)
    },
    isInTransit () {
      return !this.carrier.orbiting
    }
  }
}
</script>

<style scoped>
input[type="number"] {
  width: 80px;
}
</style>
