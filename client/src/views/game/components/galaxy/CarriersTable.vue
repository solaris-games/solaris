<template>
<div class="container">
  <div class="row mb-2 g-0">
    <div class="col-auto">
      <button class="btn btn-sm" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll" v-if="userPlayer != null">
        <span v-if="!showAll">Show All</span>
        <span v-if="showAll">Show Yours</span>
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
                    <td title="Player"><a href="javascript:;" @click="sort(['ownedByPlayer','alias'], ['ownedByPlayerId'], ['name'])"><i class="fas fa-user"></i></a></td>
                    <td><a href="javascript:;" @click="sort(['name'])">Name</a></td>
                    <td></td>
                    <td title="Specialist">
                      <a href="javascript:;" @click="sort(['specialist', 'name'], ['name'], ['_id'])"><i class="fas fa-user-astronaut"></i></a>
                    </td>
                    <td title="Ships" class="text-end"><a href="javascript:;" @click="sort(['ships'], ['name'], ['_id'])"><i class="fas fa-rocket"></i></a></td>
                    <td title="Waypoints" class="text-end"><a href="javascript:;" @click="sort(['waypoints', 'length'], ['name'], ['_id'])"><i class="fas fa-map-marker-alt"></i></a></td>
                    <!-- <td></td> -->
                    <td class="text-end"><a href="javascript:;" @click="sort(['ticksEta'], ['name'], ['_id'])">ETA</a></td>
                    <td class="text-end"><a href="javascript:;" @click="sort(['ticksEtaTotal'], ['name'], ['_id'])">Total</a></td>
                </tr>
            </thead>
            <tbody>
                <carrier-row v-for="carrier in sortedFilteredTableData"
                             v-bind:key="carrier._id"
                             :carrier="carrier"
                             @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
            </tbody>
        </table>
    </div>
  </div>

  <p v-if="!sortedFilteredTableData.length" class="text-center mt-2 mb-2">No carriers to display.</p>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GameHelper from '../../../../services/gameHelper'
import CarrierRow from './CarrierRow.vue'
import {createSortInfo, swapSort} from '../../../../services/data/sortInfo'
import {useLocalStorage} from "@/util/reactiveHooks";
import type {Carrier, Game, Star} from "@/types/game";
import {useSortedMapObjectData} from "@/views/game/components/galaxy/table";

const SORT_INFO_KEY = 'galaxy_carriers_sortInfo';

const defaultSortInfo = createSortInfo([['ticksEta']], true);

const emit = defineEmits<{
  onOpenCarrierDetailRequested: [carrierId: string],
}>();

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const showAll = ref(false);
const sortInfo = useLocalStorage(SORT_INFO_KEY, defaultSortInfo);
const searchFilter = ref('');

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const tableData = computed(() => game.value.galaxy.carriers);

const toggleShowAll = () => showAll.value = !showAll.value;

const onOpenCarrierDetailRequested = (e) => emit('onOpenCarrierDetailRequested', e);

const filter = (c: Carrier) => c.name.toLowerCase().includes(searchFilter.value.toLowerCase());

const sortedFilteredTableData = useSortedMapObjectData(tableData, sortInfo, showAll, game, filter);

const sort = (...propertyPaths) => {
  sortInfo.value = swapSort(sortInfo.value, propertyPaths);
};

onMounted(() => {
  showAll.value = !Boolean(userPlayer.value);
});
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
