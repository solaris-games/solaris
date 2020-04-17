<template>
    <tr>
        <td>{{waypoint.delayTicks}}</td>
        <td>{{getStarName(waypoint.destination)}}</td>
        <td v-if="!showAction">1d 2h 3m 4s</td>
        <td v-if="showAction">{{getWaypointActionFriendlyText(waypoint)}}</td>
        <td class="text-right"><a href="">Edit</a></td>
    </tr>
</template>

<script>
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
    getWaypointActionFriendlyText (waypoint) {
      switch (waypoint.action) {
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
    }
  }
}
</script>

<style scoped>
</style>
