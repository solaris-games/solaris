<template>
<tr>
    <td><i class="fas fa-circle" v-if="star.ownedByPlayerId" :style="{ 'color': getColour() }"></i></td>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-right">
      <span v-if="star.infrastructure" class="text-success mr-2" title="Economic infrastructure - Contributes to credits earned at the end of a cycle">{{star.infrastructure.economy}}</span>
      <span v-if="star.infrastructure" class="text-warning mr-2" title="Industrial infrastructure - Contributes to ship production">{{star.infrastructure.industry}}</span>
      <span v-if="star.infrastructure" class="text-info" title="Scientific infrastructure - Contributes to technology research">{{star.infrastructure.science}}</span>
    </td>
</tr>
</template>

<script>
import gameContainer from '../../../game/container'
import gameHelper from '../../../services/gameHelper'
import SpecialistIcon from '../specialist/SpecialistIcon'

export default {
  components: {
    'specialist-icon': SpecialistIcon
  },
  props: {
    star: Object
  },
  methods: {
    getColour () {
      return gameHelper.getPlayerColour(this.$store.state.game, this.star.ownedByPlayerId)
    },
    clickStar (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    goToStar (e) {
      gameContainer.map.panToStar(this.star)
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

td.no-padding {
  padding: 12px 0px !important;
}

td.sm-padding {
  padding: 12px 3px !important;
}
</style>
