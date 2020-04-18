<template>
    <tr>
        <td>{{waypoint.delayTicks}}</td>
        <td>{{getStarName(waypoint.destination)}}</td>
        <td v-if="!showAction">1d 2h 3m 4s</td>
        <td v-if="showAction">
            <span v-if="!isEditingWaypoints">{{getWaypointActionFriendlyText(waypoint)}}</span>

            <select v-if="isEditingWaypoints" class="form-control input-sm" id="waypointAction" v-model="waypoint.action">
                <option key="nothing" value="nothing">{{getWaypointActionFriendlyText(waypoint, 'nothing')}}</option>
                <option key="collectAll" value="collectAll">{{getWaypointActionFriendlyText(waypoint, 'collectAll')}}</option>
                <option key="dropAll" value="dropAll">{{getWaypointActionFriendlyText(waypoint, 'dropAll')}}</option>
                <option key="drop" value="drop">{{getWaypointActionFriendlyText(waypoint, 'drop')}}</option>
                <option key="collectAllBut" value="collectAllBut">{{getWaypointActionFriendlyText(waypoint, 'collectAllBut')}}</option>
                <option key="dropAllBut" value="dropAllBut">{{getWaypointActionFriendlyText(waypoint, 'dropAllBut')}}</option>
                <option key="garrison" value="garrison">{{getWaypointActionFriendlyText(waypoint, 'garrison')}}</option>
            </select>
        </td>
        <td class="text-right">
          <!-- <span v-if="isEditingWaypoints">{{waypoint.actionShips}} ships</span> -->

          <input v-if="isEditingWaypoints && showAction && isActionRequiresShips(waypoint.action)" class="form-control input-sm float-right" type="number" v-model="waypoint.actionShips"/>
        </td>
    </tr>
</template>

<script>
export default {
  props: {
    game: Object,
    waypoint: Object,
    showAction: Boolean,
    isEditingWaypoints: Boolean
  },
  methods: {
    getStarName (starId) {
      return this.game.galaxy.stars.find(s => s._id === starId).name
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
    }
  }
}
</script>

<style scoped>
input[type="number"] {
  width: 80px;
}
</style>
