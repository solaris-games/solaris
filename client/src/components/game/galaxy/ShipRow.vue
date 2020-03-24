<template>
<tr>
    <td>{{data.playerId}}</td>
    <td>{{data.name}}</td>
    <td><i class="far fa-eye"></i></td>
    <td>
      <i v-if="data.type === 0" class="fas fa-star"></i>
      <i v-if="data.type === 1" class="fas fa-rocket"></i>
    </td>
    <td>{{data.ships}}</td>
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
