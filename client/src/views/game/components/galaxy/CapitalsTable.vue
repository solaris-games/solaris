<template>
<div class="container">
  <div class="row mb-2 g-0">
    <div class="col-auto">
      <button class="btn btn-sm" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll" v-if="userPlayer != null">
        <span v-if="!showAll">Show All</span>
        <span v-if="showAll">Show Yours</span>
      </button>
    </div>
    <div class="col ms-2 me-2">
      <input type="text" class="form-control form-control-sm" v-model="searchFilter" placeholder="Search...">
    </div>
  </div>

  <div class="row">
    <div class="table-responsive">
      <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
              <tr>
                  <td title="Player"><a href="javascript:;" @click="sort(['ownedByPlayer','alias'], ['ownedByPlayerId'], ['name'])"><i class="fas fa-user"></i></a></td>
                  <td><a href="javascript:;" @click="sort(['name'])">Name</a></td>
                  <td></td>
                  <td title="Specialist">
                    <a href="javascript:;" @click="sort(['specialist', 'name'])"><i class="fas fa-user-astronaut"></i></a>
                  </td>
                  <td title="Economy Infrastructure" class="text-end">
                    <a href="javascript:;" @click="sort(['infrastructure','economy'])"><i class="fas fa-money-bill-wave me-2"></i></a>
                  </td>
                  <td title="Industry Infrastructure" class="text-end">
                    <a href="javascript:;" @click="sort(['infrastructure','industry'])"><i class="fas fa-tools me-2"></i></a>
                  </td>
                  <td title="Science Infrastructure" class="text-end">
                    <a href="javascript:;" @click="sort(['infrastructure','science'])"><i class="fas fa-flask"></i></a>
                  </td>
              </tr>
          </thead>
          <tbody>
              <capital-row v-for="star in sortedFilteredTableData" v-bind:key="star._id" :star="star"
                @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!sortedFilteredTableData.length" class="text-center mt-2 mb-2">No stars to display.</p>
</div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import GameHelper from '../../../../services/gameHelper'
import CapitalRow from './CapitalRow.vue'
import {createSortInfo, swapSort} from '../../../../services/data/sortInfo'
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type {Game, Star} from "@/types/game";
import {useSortedMapObjectData} from "@/views/game/components/galaxy/table";
import {useLocalStorage} from "@/util/reactiveHooks";

const emit = defineEmits<{
  onOpenStarDetailRequested: [starId: string],
}>();

const SORT_INFO_KEY = "galaxy_capitals_sortInfo";

const defaultSortInfo = createSortInfo([['name']], true);

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const sortInfo = useLocalStorage(SORT_INFO_KEY, defaultSortInfo);

const showAll = ref(false);
const searchFilter = ref('');

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const tableData = computed(() => game.value.galaxy.stars.filter(s => s.homeStar));

const filter = (s: Star) => s.name.toLowerCase().includes(searchFilter.value.toLowerCase());

const sortedFilteredTableData = useSortedMapObjectData(tableData, sortInfo, showAll, game, filter);

const toggleShowAll = () => showAll.value = !showAll.value;

const sort = (...propertyPaths: string[][]) => {
  sortInfo.value = swapSort(sortInfo.value, propertyPaths);
};

const onOpenStarDetailRequested = (starId: string) => emit('onOpenStarDetailRequested', starId);

onMounted(() => {
  showAll.value = !Boolean(userPlayer.value);
});
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
