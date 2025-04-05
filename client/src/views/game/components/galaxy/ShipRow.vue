<template>
<tr>
    <td><player-icon v-if="ship.ownedByPlayerId" :playerId="ship.ownedByPlayerId" /></td>
    <td><a href="javascript:;" @click="clickShip">{{ship.name}}</a></td>
    <td><a href="javascript:;" @click="goToShip"><i class="far fa-eye"></i></a></td>
    <td>
      <i v-if="ship.type === 0" class="fas fa-star"></i>
      <i v-if="ship.type === 1" class="fas fa-rocket"></i>
    </td>
    <td><specialist-icon :type="ship.type === 0 ? 'star' : 'carrier'" :specialist="ship.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-end">{{ship.ships == null ? '???' : ship.ships}}</td>
</tr>
</template>

<script>
import gameContainer from '../../../../game/container'
import PlayerIconVue from '../player/PlayerIcon.vue'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import {eventBusInjectionKey} from "@/eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'player-icon': PlayerIconVue,
    'specialist-icon': SpecialistIcon
  },
  props: {
    ship: Object
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  methods: {
    clickShip (e) {
      if (this.ship.type == 0) {
        this.$emit('onOpenStarDetailRequested', this.ship._id)
      } else {
        this.$emit('onOpenCarrierDetailRequested', this.ship._id)
      }
    },
    goToShip (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToLocation, { location: this.ship.location });
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
