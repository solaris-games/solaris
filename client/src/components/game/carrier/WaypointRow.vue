<template>
    <tr>
        <td>{{waypoint.delayTicks}}</td>
        <td>{{getStarName(waypoint.destination)}}</td>
        <td v-if="!showAction">{{timeRemainingEta}}</td>
        <td v-if="showAction">
            <span>{{getWaypointActionFriendlyText(waypoint)}}</span>
        </td>
        <td class="text-right">
          <a href="javascript:;" @click="editWaypoint">Edit</a>
        </td>
    </tr>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
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
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 100)
    }
  },
  destroyed () {
    clearInterval(this.intervalFunction)
  },
  methods: {
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
      }
    },
    recalculateTimeRemaining () {
      let timeRemainingEtaDate = GameHelper.calculateTimeByTicks(this.waypoint.ticksEta, 
        this.$store.state.game.settings.gameTime.speed, this.$store.state.game.state.lastTickDate)

      this.timeRemainingEta = GameHelper.getCountdownTimeString(this.$store.state.game, timeRemainingEtaDate)
    }
  }
}
</script>

<style scoped>
input[type="number"] {
  width: 80px;
}
</style>
