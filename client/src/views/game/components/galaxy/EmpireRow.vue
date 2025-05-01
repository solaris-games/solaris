<template>
<tr :class="{'defeated':empire.defeated}">
    <td><player-icon :playerId="empire._id"/></td>
    <td><a href="javascript:;" @click="onOpenPlayerDetailRequested">{{empire.alias}}</a></td>
    <td><a href="javascript:;" @click="goToEmpire"><i class="far fa-eye"></i></a></td>
    <td class="text-end">{{empire.totalStars}}</td>
    <td class="text-end">{{empire.totalCarriers}}</td>
    <td class="text-end">{{empire.totalSpecialists}}</td>
    <td class="text-end">{{empire.totalShips}}</td>
    <td class="text-end">{{empire.newShips}}</td>
    <td class="text-end text-success">{{empire.totalEconomy}}</td>
    <td class="text-end text-warning">{{empire.totalIndustry}}</td>
    <td class="text-end text-info">{{empire.totalScience}}</td>
</tr>
</template>

<script>
import PlayerIconVue from '../player/PlayerIcon.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';

export default {
  components: {
    'player-icon': PlayerIconVue
  },
  props: {
    empire: Object
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.empire._id)
    },
    goToEmpire (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: this.empire });
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

.defeated {
  opacity: 0.5;
}
</style>
