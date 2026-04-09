<template>
<tr>
    <td><a href="javascript:;" @click="clickStar">{{star.name}}</a></td>
    <td class="no-padding"><a href="javascript:;" @click="goToStar"><i class="far fa-eye"></i></a></td>
    <td class="sm-padding"><specialist-icon :type="'star'" :specialist="star.specialist" :hideDefaultIcon="true"></specialist-icon></td>
    <star-resources :resources="star.naturalResources" :compareResources="star.terraformedResources" :displayIcon="false"/>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-success me-2" title="Economic infrastructure - Contributes to credits earned at the end of a cycle">{{star.infrastructure.economy}}</span>
    </td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-warning me-2" title="Industrial infrastructure - Contributes to ship production">{{star.infrastructure.industry}}</span>
    </td>
    <td class="text-end">
      <span v-if="star.infrastructure" class="text-info" title="Scientific infrastructure - Contributes to technology research">{{star.infrastructure.science}}</span>
    </td>
    <td class="last">
      <ignore-bulk-upgrade :starId="star._id" :highlightIgnoredInfrastructure="highlightIgnoredInfrastructure" @bulkIgnoreChanged="onBulkIgnoreChanged"/>
    </td>
</tr>
</template>

<script setup lang="ts">
import SpecialistIcon from '../specialist/SpecialistIcon.vue'
import IgnoreBulkUpgrade from './IgnoreBulkUpgrade.vue'
import StarResources from './StarResources.vue'
import {eventBusInjectionKey} from "@/eventBus";
import { inject } from 'vue';
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import type {Star} from "@/types/game";
import type {InfrastructureType, MapObject} from "@solaris/common";

const props = defineProps<{
  star: Star,
  highlightIgnoredInfrastructure: InfrastructureType | undefined,
}>();

const emit = defineEmits<{
  bulkIgnoreChanged: [{ starId: string }],
  onOpenStarDetailRequested: [starId: string],
}>();

const eventBus = inject(eventBusInjectionKey)!;

const onBulkIgnoreChanged = (e: { starId: string }) => emit('bulkIgnoreChanged', e);

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

td.last {
    width: 1px;
    white-space: nowrap;
}
</style>
