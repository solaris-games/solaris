<template>
    <span v-if="isOrbitalMechanicsEnabled" class="text-warning" title="Orbital Mechanics may affect waypoint ETAs">*</span>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'

export default {
  computed: {
    isOrbitalMechanicsEnabled () {
      return GameHelper.isOrbitalMechanicsEnabled(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
span {
    cursor: pointer;
}
</style>
