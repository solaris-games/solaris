<template>
<div class="container">
  <div class="row mb-2" v-if="tableData.length">
    <div class="col-6 ps-0">
      <input type="text" class="form-control form-control-sm" v-model="searchFilter" placeholder="Search...">
    </div>
  </div>

  <div class="row" v-if="tableData.length">
    <div class="table-responsive ps-0 pe-0">
      <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
              <tr>
                  <td><a href="javascript:;" @click="sort(['name'])">Name</a></td>
                  <td></td>
                  <td title="Specialist">
                    <a href="javascript:;" @click="sort(['specialist', 'name'])"><i class="fas fa-user-astronaut"></i></a>
                  </td>
                  <td v-if="!isSplitResources"><a href="javascript:;" @click="sort(['naturalResources'])">Resources</a></td>
                  <td title="Economy Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'economy'])"><i class="fas fa-globe me-2 text-success"> E</i></a></td>
                  <td title="Industry Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'industry'])"><i class="fas fa-globe me-2 text-warning"> I</i></a></td>
                  <td title="Science Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'science'])"><i class="fas fa-globe me-2 text-info"> S</i></a></td>
                  <td title="Economy Infrastructure" class="text-end">
                      <a href="javascript:;" @click="sort(['infrastructure','economy'])"><i class="fas fa-money-bill-wave me-2"></i></a>
                  </td>
                  <td title="Industry Infrastructure" class="text-end">
                      <a href="javascript:;" @click="sort(['infrastructure','industry'])"><i class="fas fa-tools me-2"></i></a>
                  </td>
                  <td title="Science Infrastructure" class="text-end">
                      <a href="javascript:;" @click="sort(['infrastructure','science'])"><i class="fas fa-flask"></i></a>
                  </td>
                  <td class="last"></td>
              </tr>
          </thead>
          <tbody>
              <bulk-infrastructure-upgrade-star-table-row v-for="star in sortedFilteredTableData"
                        v-bind:key="star._id"
                        :star="star"
                        @bulkIgnoreChanged="onBulkIgnoreChanged"
                        @onOpenStarDetailRequested="onOpenStarDetailRequested"
                        :highlightIgnoredInfrastructure="highlightIgnoredInfrastructure"/>
          </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { ref, computed } from 'vue';
import GameHelper from '../../../../services/gameHelper';
import BulkInfrastructureUpgradeStarTableRow from './BulkInfrastructureUpgradeStarTableRow.vue';
import type {InfrastructureType} from "@solaris-common";
import {createSortInfo, swapSort} from "@/services/data/sortInfo";
import type {Game} from "@/types/game";
import {useSorted} from "@/util/sort";

const defaultSortInfo = createSortInfo([['name']], true);

const props = defineProps<{
  highlightIgnoredInfrastructure: InfrastructureType | undefined,
}>();

const emit = defineEmits<{
  bulkIgnoreChanged: [{ starId: string }],
  onOpenStarDetailRequested: [starId: string],
}>();

const store = useGameStore();
const game = computed<Game>(() => store.game!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);
const tableData = computed(() => game.value.galaxy.stars.filter(s => s.ownedByPlayerId === userPlayer.value._id));
const isSplitResources = computed(() => GameHelper.isSplitResources(game.value));

const sortInfo = ref(defaultSortInfo);
const searchFilter = ref('');

const sortedFilteredTableData = useSorted(game, tableData, sortInfo);

const onBulkIgnoreChanged = (e: { starId: string }) => emit('bulkIgnoreChanged', e);

const sort = (...propertyPaths: string[][]) => {
  sortInfo.value = swapSort(sortInfo.value, propertyPaths);
};

const onOpenStarDetailRequested = (e: string) => emit('onOpenStarDetailRequested', e);
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

td.last {
    width: 1px;
    white-space: nowrap;
}
</style>
