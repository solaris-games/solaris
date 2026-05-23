<template>
<tr>
    <td><player-icon v-if="ship.ownedByPlayerId" :playerId="ship.ownedByPlayerId" /></td>
    <td><a href="javascript:;" @click="clickShip">{{ship.name}}</a></td>
    <td><a href="javascript:;" @click="goToShip"><i class="far fa-eye"></i></a></td>
    <td>
      <i v-if="ship.type === 'star'" class="fas fa-star"></i>
      <i v-if="ship.type === 'carrier'" class="fas fa-rocket"></i>
    </td>
    <td><specialist-icon :type="ship.type === 'star' ? 'star' : 'carrier'" :specialist="ship.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-end">{{ship.ships === null ? '???' : ship.ships}}</td>
</tr>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { MapCommandEventBusEventNames } from '@solaris/map-rendering';
import PlayerIcon from '../player/PlayerIcon.vue'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import {eventBusInjectionKey} from "@/eventBus";
import type {MapObjectWithShips} from "@/views/game/components/galaxy/types";

const props = defineProps<{
  ship: MapObjectWithShips,
}>();

const emit = defineEmits<{
  onOpenStarDetailRequested: [starId: string],
  onOpenCarrierDetailRequested: [carrierId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const clickShip = () => {
  if (props.ship.type === 'carrier') {
    emit('onOpenCarrierDetailRequested', props.ship._id);
  } else {
    emit('onOpenStarDetailRequested', props.ship._id);
  }
};

const goToShip = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToLocation, {location: props.ship.location});
};
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
