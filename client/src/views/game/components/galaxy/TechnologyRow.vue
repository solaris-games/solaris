<template>
<tr :class="{'defeated':technology.defeated}">
    <td><player-icon :playerId="technology._id"/></td>
    <td><a href="javascript:;" @click="onOpenPlayerDetailRequested">{{technology.alias}}</a></td>
    <td><a href="javascript:;" @click="goToEmpire"><i class="far fa-eye"></i></a></td>
    <td class="text-end" :class="displayStyle('scanning')">{{technology.scanning}}</td>
    <td class="text-end" :class="displayStyle('hyperspace')">{{technology.hyperspace}}</td>
    <td class="text-end" :class="displayStyle('terraforming')">{{technology.terraforming}}</td>
    <td class="text-end" :class="displayStyle('experimentation')">{{technology.experimentation}}</td>
    <td class="text-end" :class="displayStyle('weapons')">{{technology.weapons}}</td>
    <td class="text-end" :class="displayStyle('banking')">{{technology.banking}}</td>
    <td class="text-end" :class="displayStyle('manufacturing')">{{technology.manufacturing}}</td>
    <td class="text-end" :class="displayStyle('specialists')">{{technology.specialists}}</td>
</tr>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import PlayerIconVue from '../player/PlayerIcon.vue'
import {eventBusInjectionKey} from "@/eventBus";
import { inject } from 'vue';
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";

export default {
  components: {
    'player-icon': PlayerIconVue
  },
  props: {
    player: Object,
    userPlayer: Object,
    technology: Object
  },
  setup () {
    return {
      eventBus: inject(eventBusInjectionKey)
    }
  },
  methods: {
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', this.technology._id)
    },
    goToEmpire (e) {
      this.eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToPlayer, { player: this.technology });
    },
    displayStyle(research) {
      if (this.technology._id == this.userPlayer?._id) {
        return {
          "text-success": this.hasHighestTechLevel(research),
          "text-danger": this.hasLowestTechLevel(research)
        }
      }
    },
    hasHighestTechLevel (research) {
      return GameHelper.playerHasHighestTechLevel(
        this.$store.state.game,
        research,
        this.userPlayer
      );
    },
    hasLowestTechLevel (research) {
      return GameHelper.playerHasLowestTechLevel(
        this.$store.state.game,
        research,
        this.userPlayer
      );
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
