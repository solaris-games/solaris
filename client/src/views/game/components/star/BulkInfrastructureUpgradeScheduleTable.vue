<template>
<div class="container">
  <div class="row"> <!-- v-if=" .length" -->
    <div class="table-responsive ps-0 pe-0">
      <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
              <tr>
                  <td><a href="javascript:;" @click="sort(['tick'])">Tick</a></td>
                  <td><a href="javascript:;" @click="sort(['infrastructureType'])">Infrastructure</a></td>
                  <td><a href="javascript:;" @click="sort(['buyType'])">Buy type</a></td>
                  <td><a href="javascript:;" @click="sort(['amount'])">Amount</a></td>
                  <td ></td> <!-- Toggle repeat -->
                  <td class="last"></td> <!-- Trash & Confirm -->
              </tr>
          </thead>
          <tbody>
              <bulk-infrastructure-upgrade-schedule-table-row v-for="action in sortedTableData"
                            v-bind:key="action._id"
                            :action="action"
                            @bulkScheduleTrashed="onTrashed"/>
          </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BulkInfrastructureUpgradeScheduleTableRow from './BulkInfrastructureUpgradeScheduleTableRow.vue'
import GameHelper from '../../../../services/gameHelper';
import type {Game} from "@/types/game";
import {useSorted} from "@/util/sort";
import {createSortInfo, swapSort} from "@/services/data/sortInfo";

const defaultSortInfo = createSortInfo([['tick']], true);

const emit = defineEmits<{
  bulkScheduleTrashed: [actionId: string],
}>();

const onTrashed = (actionId: string) => emit('bulkScheduleTrashed', actionId);

const store = useGameStore();
const game = computed<Game>(() => store.game!);
const userPlayer = computed(() => GameHelper.getUserPlayer(game.value)!);
const tableData = computed(() => userPlayer.value.scheduledActions);

const sortInfo = ref(defaultSortInfo);

const sort = (...propertyPaths: string[][]) => {
  sortInfo.value = swapSort(sortInfo.value, propertyPaths);
};

const sortedTableData = useSorted(game, tableData, sortInfo);
</script>

<style scoped>
td {
  padding: 20px 6px !important;
}

td.last {
    width: 1px;
    white-space: nowrap;
}
</style>
