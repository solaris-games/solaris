<template>
<tr>
    <td>{{data.playerId}}</td>
    <td>{{data.name}}</td>
    <td><i class="far fa-eye"></i></td>
    <td>{{data.ships}}</td>
    <td>{{data.waypoints}}</td>
    <td>{{data.waypointsLooped}}</td>
    <td>{{data.eta}}</td>
    <td>{{data.totalEta}}</td>
</tr>
</template>

<script>
export default {
  components: {
  },
  props: {
    data: null
  }
}
</script>

<style scoped>
</style>
