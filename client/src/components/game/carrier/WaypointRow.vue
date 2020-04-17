<template>
    <tr>
        <td>{{waypoint.delayTicks}}</td>
        <td>{{getStarName(waypoint.destination)}}</td>
        <td v-if="!showAction">1d 2h 3m 4s</td>
        <td v-if="showAction">
            <span v-if="!isEditing">{{getWaypointActionFriendlyText(waypoint)}}</span>

            <select v-if="isEditing" class="form-control" id="waypointAction" v-model="waypoint.action">
                <option key="nothing" value="nothing">{{getWaypointActionFriendlyText(waypoint, 'nothing')}}</option>
                <option key="collectAll" value="collectAll">{{getWaypointActionFriendlyText(waypoint, 'collectAll')}}</option>
                <option key="dropAll" value="dropAll">{{getWaypointActionFriendlyText(waypoint, 'dropAll')}}</option>
                <option key="drop" value="drop">{{getWaypointActionFriendlyText(waypoint, 'drop')}}</option>
                <option key="collectAllBut" value="collectAllBut">{{getWaypointActionFriendlyText(waypoint, 'collectAllBut')}}</option>
                <option key="dropAllBut" value="dropAllBut">{{getWaypointActionFriendlyText(waypoint, 'dropAllBut')}}</option>
                <option key="garrison" value="garrison">{{getWaypointActionFriendlyText(waypoint, 'garrison')}}</option>
            </select>
        </td>
        <td class="text-right"><a href="" @click="toggleEdit">Edit</a></td>
    </tr>
</template>

<script>
export default {
  props: {
    game: Object,
    waypoint: Object,
    showAction: Boolean
  },
  data () {
      return {
          isEditing: false
      }
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
    toggleEdit (e) {
        this.isEditing = !this.isEditing

        e.preventDefault()
    }
  }
}
</script>

<style scoped>
</style>
