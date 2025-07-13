<template>
  <table class="table table-striped table-hover">
    <thead class="table-dark">
    <tr>
      <td>Star</td>
      <td class="text-end">Upgrade</td>
      <td class="text-end"><i class="fas fa-dollar-sign"></i></td>
    </tr>
    </thead>
    <tbody>
    <tr v-for="previewStar in props.upgradeReport.stars" :key="previewStar.starId">
      <td>
        <a href="javascript:;" @click="panToStar(previewStar.starId)">
          <i class="fas fa-eye"></i>
          {{ getStar(previewStar.starId).name }}
        </a>
      </td>
      <td class="text-end">
        <span class="text-danger">{{ previewStar.infrastructureCurrent }}</span>
        <i class="fas fa-arrow-right ms-2 me-2"></i>
        <span class="text-success">{{ previewStar.infrastructure }}</span>
      </td>
      <td class="text-end">
        {{ previewStar.infrastructureCostTotal }}
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type {BulkUpgradeReport, MapObject} from "@solaris-common";
import GameHelper from "@/services/gameHelper";
import type {State} from "@/store";
import { useStore, type Store } from 'vuex';
import MapCommandEventBusEventNames from "@/eventBusEventNames/mapCommand";
import {eventBusInjectionKey} from "@/eventBus";
import { inject } from 'vue';

const eventBus = inject(eventBusInjectionKey)!;

const store: Store<State> = useStore();

const props = defineProps<{
  upgradeReport: BulkUpgradeReport<string>,
}>();

const getStar = (starId: string) => {
  return GameHelper.getStarById(store.state.game, starId)!;
};

const panToStar = (starId: string) => {
  const star = getStar(starId);

  eventBus.emit(MapCommandEventBusEventNames.MapCommandPanToObject, { object: star as MapObject<string> });
};
</script>

<style scoped>

</style>
