<template>
<tr>
    <td><i class="fas fa-circle" v-if="star.ownedByPlayerId" :style="{ 'color': colour }"></i></td>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-success me-2" title="Economic infrastructure - Contributes to credits earned at the end of a cycle">{{star.infrastructure.economy}}</span>
      <span v-if="star.infrastructure" class="text-warning me-2" title="Industrial infrastructure - Contributes to ship production">{{star.infrastructure.industry}}</span>
      <span v-if="star.infrastructure" class="text-info" title="Scientific infrastructure - Contributes to technology research">{{star.infrastructure.science}}</span>
    </td>
    <td class="text-end">
      <star-resources :resources="star.naturalResources" :compareResources="star.terraformedResources" :displayIcon="false" />
    </td>
</tr>
</template>

<script>
import gameContainer from '../../../../game/container'
import gameHelper from '../../../../services/gameHelper'
import SpecialistIcon from '../specialist/SpecialistIcon'
import StarResourcesVue from '../star/StarResources'

export default {
  components: {
    'specialist-icon': SpecialistIcon,
    'star-resources': StarResourcesVue
  },
  props: {
    star: Object
  },
  methods: {
    clickStar (e) {
      this.$emit('onOpenStarDetailRequested', this.star._id)
    },
    goToStar (e) {
      gameContainer.map.panToStar(this.star)
    }
  },
  computed: {
    colour () {
      return this.$store.getters.getColourForPlayer(this.star.ownedByPlayerId).value
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
