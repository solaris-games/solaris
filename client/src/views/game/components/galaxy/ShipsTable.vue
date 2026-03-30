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
                  <td title="Player">
                    <a href="javascript:;" @click="sort(['ownedByPlayer','alias'], ['ownedByPlayerId'], ['name'])"><i class="fas fa-user"></i></a>
                  </td>
                  <td>
                    <a href="javascript:;" @click="sort(['name'])">Name</a>
                  </td>
                  <td></td>
                  <td title="Type">
                    <a href="javascript:;" class="small text-decoration-none" @click="sort(['type'])"><i class="fas fa-star"></i> / <i class="fas fa-rocket"></i></a>
                    </td>
                  <td title="Specialist">
                    <a href="javascript:;" @click="sort(['specialist', 'name'])"><i class="fas fa-user-astronaut"></i></a>
                  </td>
                  <td title="Ships" class="text-end">
                    <a href="javascript:;" @click="sort(['ships'])"><i class="fas fa-rocket"></i></a>
                  </td>
              </tr>
          </thead>
          <tbody>
              <ship-row v-for="ship in sortedFilteredTableData" v-bind:key="ship._id" :ship="ship"
                @onOpenStarDetailRequested="onOpenStarDetailRequested"
                @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!sortedFilteredTableData.length" class="text-center mt-2 mb-2">No ships to display.</p>
</div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { ref, computed, onMounted } from 'vue';
import GameHelper from '../../../../services/gameHelper'
import ShipRow from './ShipRow.vue'
import {createSortInfo, swapSort} from '../../../../services/data/sortInfo'
import type {Game} from "@/types/game";
import {useLocalStorage} from "@/util/reactiveHooks";
import {useSortedMapObjectData} from "@/views/game/components/galaxy/table";
import type {MapObjectWithShips} from "@/views/game/components/galaxy/types";

const SORT_INFO_KEY = 'galaxy_ships_sortInfo';

const defaultSortInfo = createSortInfo([['name']], true);

const emit = defineEmits<{
  onOpenStarDetailRequested: [starId: string],
  onOpenCarrierDetailRequested: [carrierId: string],
}>();

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const showAll = ref(false);
const sortInfo = useLocalStorage(SORT_INFO_KEY, defaultSortInfo);
const searchFilter = ref('');

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const tableData = computed(() => {
  const starShips: MapObjectWithShips[] = game.value.galaxy.stars
    .filter(s => s.ships)
    .map(s => ({
      _id: s._id,
      ownedByPlayerId: s.ownedByPlayerId,
      name: s.name,
      ships: s.ships,
      type: 'star',
      location: s.location,
      specialist: s.specialist
    }));

  const carrierShips: MapObjectWithShips[] = game.value.galaxy.carriers
    .filter(s => s.ships)
    .map(c => ({
      _id: c._id,
      ownedByPlayerId: c.ownedByPlayerId,
      name: c.name,
      ships: c.ships,
      type: 'carrier',
      location: c.location,
      specialist: c.specialist
    }));

  return starShips.concat(carrierShips);
});

const toggleShowAll = () => showAll.value = !showAll.value;

const onOpenCarrierDetailRequested = (e: string) => emit('onOpenCarrierDetailRequested', e);

const onOpenStarDetailRequested = (e: string) => emit('onOpenStarDetailRequested', e);

const filter = (c: MapObjectWithShips) => c.name.toLowerCase().includes(searchFilter.value.toLowerCase());

const sortedFilteredTableData = useSortedMapObjectData<MapObjectWithShips>(tableData, sortInfo, showAll, game, filter);

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
