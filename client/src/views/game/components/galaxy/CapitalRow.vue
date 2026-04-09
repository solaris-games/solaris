<template>
  <tr>
    <td><player-icon v-if="star.ownedByPlayerId" :playerId="star.ownedByPlayerId" /></td>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-success me-2" title="Economic infrastructure - Contributes to credits earned at the end of a cycle">{{star.infrastructure.economy}}</span>
    </td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-warning me-2" title="Industrial infrastructure - Contributes to ship production">{{star.infrastructure.industry}}</span>
    </td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-info" title="Scientific infrastructure - Contributes to technology research">{{star.infrastructure.science}}</span>
    </td>
  </tr>
</template>

<script setup lang="ts">
import PlayerIcon from '../player/PlayerIcon.vue'
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import {eventBusInjectionKey} from "../../../../eventBus";
import { inject } from 'vue';
import type {Star} from "@/types/game";
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import type {MapObject} from "@solaris/common";

const props = defineProps<{
  star: Star,
}>();

const emit = defineEmits<{
  onOpenStarDetailRequested: [starId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const clickStar = () => emit('onOpenStarDetailRequested', props.star._id);

const goToStar = () => eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: props.star as MapObject<string> });
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
