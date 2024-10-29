<template>
    <tr>
        <td v-if="userPlayerOwnsCarrier"><span v-if="!(isFirstWaypoint(waypoint) && isInTransit)">{{waypoint.delayTicks}}</span></td>
        <td><a href="javascript:;" @click="onOpenStarDetailRequested">{{getStarName(waypoint.destination)}}</a></td>
        <td v-if="!showAction">{{timeRemainingEta}}</td>
        <td v-if="showAction">
            <span>{{getWaypointActionFriendlyText(waypoint)}}</span>
        </td>
        <td class="text-end" v-if="!$isHistoricalMode() && canEditWaypoints">
          <a href="javascript:;" @click="editWaypoint">Edit</a>
        </td>
    </tr>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

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
      this.intervalFunction = setInterval(this.recalculateTimeRemaining, 250)
      this.recalculateTimeRemaining()
    }
  },
  unmounted () {
    clearInterval(this.intervalFunction)
  },
  methods: {
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', this.waypoint.destination)
    },
    getStarName (starId) {
      let star = this.$store.state.game.galaxy.stars.find(s => s._id === starId)

      return star ? star.name : '???'
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
    userPlayer() {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    userPlayerOwnsCarrier: function () {
      return this.userPlayer &&
        GameHelper.getCarrierOwningPlayer(this.$store.state.game, this.carrier)._id === this.userPlayer._id
    },
    canEditWaypoints: function () {
      return !GameHelper.isGameFinished(this.$store.state.game) && this.userPlayerOwnsCarrier && !this.carrier.isGift
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
