<template>
<tr>
    <td><player-icon v-if="carrier.ownedByPlayerId" :playerId="carrier.ownedByPlayerId" /></td>
    <td><a href="javascript:;" @click="clickCarrier">{{carrier.name}}</a></td>
    <td><a href="javascript:;" @click="goToCarrier"><i class="far fa-eye"></i></a></td>
    <td><specialist-icon :type="'carrier'" :defaultIcon="'rocket'" :specialist="carrier.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-end">{{carrier.ships == null ? '???' : carrier.ships}}</td>
    <td class="text-end" :class="{'text-warning':carrier.waypointsLooped}" :title="carrier.waypointsLooped?'Looped':'Unlooped'">{{carrier.waypoints.length}}</td>
    <td class="text-end">
      <span class="text-small" v-if="carrier.waypoints.length && carrier.ticksEta !== null && carrier.ticksEta !== undefined">
        <timer :ticks="carrier.ticksEta" />
      </span>
    </td>
    <td class="text-end text-muted">
      <span v-if="carrier.waypoints.length && carrier.ticksEtaTotal !== null && carrier.ticksEtaTotal !== undefined" class="text-small">
        <timer :ticks="carrier.ticksEtaTotal" />
      </span>
    </td>
</tr>
</template>

<script setup lang="ts">
import PlayerIcon from '../player/PlayerIcon.vue'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import { inject } from 'vue';
import type {Carrier} from "@/types/game";
import Timer from "@/views/game/components/time/Timer.vue";
import type {MapObject} from "@solaris-common";

const props = defineProps<{
  carrier: Carrier,
}>();

const emit = defineEmits<{
  onOpenCarrierDetailRequested: [carrierId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const clickCarrier = () => {
  emit('onOpenCarrierDetailRequested', props.carrier._id);
};

const goToCarrier = () => {
  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: props.carrier as MapObject<string> });
};
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
