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
                  <td title="Player"><i class="fas fa-user"></i></td>
                  <td><a href="javascript:;" @click="sort(['alias'], ['_id'] )">Name</a></td>
                  <td></td>
                  <td class="text-end" title="Scanning"><a href="javascript:;" @click="sort(['research', 'scanning'])"><i class="fas fa-binoculars"></i></a></td>
                  <td class="text-end" title="Hyperspace"><a href="javascript:;" @click="sort(['research', 'hyperspace'])"><i class="fas fa-gas-pump"></i></a></td>
                  <td class="text-end" title="Terraforming"><a href="javascript:;" @click="sort(['research', 'terraforming'])"><i class="fas fa-globe-europe"></i></a></td>
                  <td class="text-end" title="Experimentation"><a href="javascript:;" @click="sort(['research', 'experimentation'])"><i class="fas fa-microscope"></i></a></td>
                  <td class="text-end" title="Weapons"><a href="javascript:;" @click="sort(['research', 'weapons'])"><i class="fas fa-gun"></i></a></td>
                  <td class="text-end" title="Banking"><a href="javascript:;" @click="sort(['research', 'banking'])"><i class="fas fa-money-bill-alt"></i></a></td>
                  <td class="text-end" title="Manufacturing"><a href="javascript:;" @click="sort(['research', 'manufacturing'])"><i class="fas fa-industry"></i></a></td>
                  <td class="text-end" title="Specialists"><a href="javascript:;" @click="sort(['research', 'specialists'])"><i class="fas fa-user-astronaut"></i></a></td>
              </tr>
          </thead>
          <tbody>
              <technology-row v-for="player in sortedFilteredTableData"
                              v-bind:key="player._id"
                              :player="player"
                              :userPlayer="userPlayer"
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
import GameHelper from '../../../../services/gameHelper'
import TechnologyRow from './TechnologyRow.vue'
import {createSortInfo, swapSort} from "@/services/data/sortInfo";
import {useLocalStorage} from "@/util/reactiveHooks";
import type {Game, Player} from "@/types/game";
import {useSortedPlayerData} from "@/views/game/components/galaxy/table";

const SORT_INFO_KEY = 'galaxy_technology_sortInfo';

const emit = defineEmits<{
  onOpenPlayerDetailRequested: [playerId: string],
}>();

const store = useStore();
const game = computed<Game>(() => store.game);

const defaultSortInfo = createSortInfo([['alias']], true);

const showAll = ref(false);
const sortInfo = useLocalStorage(SORT_INFO_KEY, defaultSortInfo);
const searchFilter = ref('');

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value) || null);
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
