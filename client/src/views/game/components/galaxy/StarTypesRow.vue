<template>
  <tr>
    <td title="Player"><player-icon v-if="star.ownedByPlayerId" :playerId="star.ownedByPlayerId" /></td>
    <td><a href="javascript:;" @click="clickStar($event, star._id)">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar($event, star)"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td><i v-if="star.warpGate" class="fas fa-check"></i></td>
    <td><i v-if="star.isBinaryStar" class="fas fa-check"></i></td>
    <td><i v-if="star.isNebula" class="fas fa-check"></i></td>
    <td><i v-if="star.isBlackHole" class="fas fa-check"></i></td>
    <td><i v-if="star.isAsteroidField" class="fas fa-check"></i></td>
    <td><i v-if="star.isPulsar" class="fas fa-check"></i></td>
    <td><a v-if="star.isWormHole && star.wormHolePairStar != null" href="javascript:;" @click="clickStar($event, star.wormHoleToStarId)">{{star.wormHolePairStar.name}}</a>{{(star.isWormHole && star.wormHolePairStar == null ? "???" : null)}}</td>
    <td class="no-padding"><a v-if="star.wormHolePairStar != null" href="javascript:;" @click="goToStar($event, star.wormHolePairStar)"><i class="far fa-eye"></i></a></td>
    <td title="Wormhole destination owner"><player-icon v-if="star.wormHolePairStar?.ownedByPlayerId != null" :playerId="star.wormHolePairStar.ownedByPlayerId" /></td>
  </tr>
</template>

<script>
import PlayerIconVue from '../player/PlayerIcon.vue'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import { inject } from 'vue';
import MapCommandEventBusEventNames from "../../../../eventBusEventNames/mapCommand";

export default {
  components: {
    'player-icon': PlayerIconVue,
    'specialist-icon': SpecialistIcon
  },
  props: {
    star: null
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  data () {
    return {
    }
  },
  methods: {
    clickStar (e, starId) {
      this.$emit('onOpenStarDetailRequested', starId);
    },
    goToStar (e, star) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star });
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
