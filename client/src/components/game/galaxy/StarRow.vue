<template>
<tr>
    <td><i class="fas fa-circle"></i>{{data.playerId}}</td>
    <td>{{data.name}}</td>
    <td><i class="far fa-eye"></i></td>
    <td>{{data.economy}}</td>
    <td>{{data.industry}}</td>
    <td>{{data.science}}</td>
    <td>{{data.economyCost}}</td>
    <td>{{data.industryCost}}</td>
    <td>{{data.scienceCost}}</td>
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
