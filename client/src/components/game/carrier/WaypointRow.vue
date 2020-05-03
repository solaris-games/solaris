<template>
    <tr>
        <td>{{waypoint.delayTicks}}</td>
        <td>{{getStarName(waypoint.destination)}}</td>
        <td v-if="!showAction">{{getEtaString()}}</td>
        <td v-if="showAction">
            <span>{{getWaypointActionFriendlyText(waypoint)}}</span>
        </td>
        <td class="text-right">
          <a href="" @click="editWaypoint">Edit</a>
        </td>
    </tr>
</template>

<script>
import GameHelper from '../../../services/gameHelper'

export default {
  props: {
    game: Object,
    waypoint: Object,
    showAction: Boolean
  },
  methods: {
    getStarName (starId) {
      return this.game.galaxy.stars.find(s => s._id === starId).name
    },
    editWaypoint (e) {
      e.preventDefault()

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
    getEtaString () {
      return GameHelper.getCountdownTimeString(this.waypoint.eta)
    }
  }
}
</script>

<style scoped>
input[type="number"] {
  width: 80px;
}
</style>
