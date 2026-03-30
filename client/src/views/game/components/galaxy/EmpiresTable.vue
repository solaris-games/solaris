<template>
<div class="container">
  <div class="row mb-2 g-0">
    <div class="col-auto">
      <button class="btn btn-sm" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll" v-if="userPlayer != null">
        <span v-if="!showAll">Show All</span>
        <span v-if="showAll">Show You</span>
      </button>
    </div>
    <div class="col ms-2">
      <input type="text" class="form-control form-control-sm" v-model="searchFilter" placeholder="Search...">
    </div>
  </div>

  <div class="row">
    <div class="table-responsive">
      <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
              <tr>
                  <td><i class="fas fa-user"></i></td>
                  <td><a href="javascript:;" @click="sort(['alias'])">Name</a></td>
                  <td></td>
                  <td class="text-end" title="Stars"><a href="javascript:;" @click="sort(['stats', 'totalStars'])"><i class="fas fa-star"></i></a></td>
                  <td class="text-end" title="Carriers"><a href="javascript:;" @click="sort(['stats', 'totalCarriers'])"><i class="fas fa-rocket"></i></a></td>
                  <td class="text-end" title="Specialists"><a href="javascript:;" @click="sort(['stats', 'totalSpecialists'])"><i class="fas fa-user-astronaut"></i></a></td>
                  <td class="text-end" title="Ships"><a href="javascript:;" @click="sort(['stats', 'totalShips'])">S</a></td>
                  <td class="text-end" title="Ship Production"><a href="javascript:;" @click="sort(['stats', 'newShips'])"><i class="fas fa-industry"></i></a></td>
                  <td class="text-end" title="Economy Infrastructure"><a href="javascript:;" @click="sort(['stats', 'totalEconomy'])"><i class="fas fa-money-bill-wave"></i></a></td>
                  <td class="text-end" title="Industry Infrastructure"><a href="javascript:;" @click="sort(['stats', 'totalIndustry'])"><i class="fas fa-tools"></i></a></td>
                  <td class="text-end" title="Science Infrastructure"><a href="javascript:;" @click="sort(['stats', 'totalScience'])"><i class="fas fa-flask"></i></a></td>
              </tr>
          </thead>
          <tbody>
              <empire-row v-for="empire in sortedFilteredTableData" v-bind:key="empire._id" :empire="empire"
                @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!sortedFilteredTableData.length" class="text-center mt-2 mb-2">No empires to display.</p>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import EmpireRow from './EmpireRow.vue'
import GameHelper from '../../../../services/gameHelper'
import {createSortInfo, swapSort} from '../../../../services/data/sortInfo'
import type {Game, Player} from "@/types/game";
import {useLocalStorage} from "@/util/reactiveHooks";
import {useSortedPlayerData} from "@/views/game/components/galaxy/table";

const SORT_INFO_KEY = 'galaxy_empires_sortInfo';

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const store = useStore();
const game = computed<Game>(() => store.game);

const defaultSortInfo = createSortInfo([['alias']], true);

const showAll = ref(false);
const sortInfo = useLocalStorage(SORT_INFO_KEY, defaultSortInfo);
const searchFilter = ref('');

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const tableData = computed(() => game.value.galaxy.players);

const toggleShowAll = () => showAll.value = !showAll.value;

const onOpenPlayerDetailRequested = (e) => emit('onOpenPlayerDetailRequested', e);

const sort = (...propertyPaths) => {
  sortInfo.value = swapSort(sortInfo.value, propertyPaths);
};

const filter = (p: Player) => p.alias.toLowerCase().includes(searchFilter.value.toLowerCase());

const sortedFilteredTableData = useSortedPlayerData(tableData, sortInfo, showAll, game, filter);

onMounted(() => {
  showAll.value = userPlayer.value != null;
});
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
