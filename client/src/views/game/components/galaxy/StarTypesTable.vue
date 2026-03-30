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
                    <a href="javascript:;" @click="sort(['specialist', 'name'], ['name'])"><i class="fas fa-user-astronaut"></i></a>
                  </td>
                  <td title="Warp Gate">
                    <a href="javascript:;" @click="sort(['warpGate'], ['name'])"><i class="fas fa-dungeon"></i></a>
                  </td>
                  <td title="Binary Star">
                    <a href="javascript:;" @click="sort(['isBinaryStar'], ['name'])"><star-icon :isBinaryStar="true"></star-icon></a>
                  </td>
                  <td title="Nebula">
                    <a href="javascript:;" @click="sort(['isNebula'], ['name'])"><star-icon :isNebula="true"></star-icon></a>
                  </td>
                  <td title="Black Hole">
                    <a href="javascript:;" @click="sort(['isBlackHole'], ['name'])"><star-icon :isBlackHole="true"></star-icon></a>
                  </td>
                  <td title="Asteroid Field">
                    <a href="javascript:;" @click="sort(['isAsteroidField'], ['name'])"><star-icon :isAsteroidField="true"></star-icon></a>
                  </td>
                  <td title="Pulsar">
                    <a href="javascript:;" @click="sort(['isPulsar'], ['name'])"><star-icon :isPulsar="true"></star-icon></a>
                  </td>
                  <td title="Wormhole" style="text-align: center;">
                    <a href="javascript:;" @click="sort(['isWormHole'], ['wormHolePairStar', 'name'])"><star-icon :isWormHole="true"></star-icon></a>
                  </td>
                  <td></td>
                  <td title="Wormhole destination owner"><a href="javascript:;" @click="sort(['wormHolePairStar', 'ownedByPlayer','alias'], ['wormHolePairStar', 'ownedByPlayerId'], ['wormHolePairStar', 'name'])"><i class="fas fa-user"></i></a></td>
                <!--TODO: Fix time machine bar on tick.-->
              </tr>
          </thead>
          <tbody>
              <star-types-row v-for="star in sortedFilteredTableData"
                              v-bind:key="star._id"
                              :star="star"
                              @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!sortedFilteredTableData.length" class="text-center mt-2 mb-2">No stars to display.</p>
</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GameHelper from '../../../../services/gameHelper'
import StarIcon from '../star/StarIcon.vue'
import StarTypesRow from './StarTypesRow.vue'
import {createSortInfo, swapSort} from "@/services/data/sortInfo";
import {useLocalStorage} from "@/util/reactiveHooks";
import type {Game, Star} from "@/types/game";
import {useSortedMapObjectData} from "@/views/game/components/galaxy/table";
import type {StarWithTypes} from "@/views/game/components/galaxy/types";


const emit = defineEmits<{
  onOpenStarDetailRequested: [starId: string],
}>();

const SORT_INFO_KEY = "galaxy_startypes_sortInfo";

const defaultSortInfo = createSortInfo([['name']], true);

const store = useGameStore();
const game = computed<Game>(() => store.game!);

const sortInfo = useLocalStorage(SORT_INFO_KEY, defaultSortInfo);

const showAll = ref(false);
const searchFilter = ref('');

const userPlayer = computed(() => GameHelper.getUserPlayer(game.value));
const tableData = computed<StarWithTypes[]>(() =>
  game.value.galaxy.stars.map(s => {
    const star: StarWithTypes = {
      ...s,
      isWormHole: s.wormHoleToStarId != null,
      wormHolePairStar: s.wormHoleToStarId != null ? GameHelper.getStarById(game.value, s.wormHoleToStarId)! : null,
    };
    return star;
  }));

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
