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
                  <td title="Player"><a href="javascript:;" @click="sort(['ownedByPlayer','_id'],['ownedByPlayer','_id'], ['name'])"><i class="fas fa-user"></i></a></td>
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
                  <td v-if="!isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources','economy'])">Resources</a></td>
                  <td title="Economy Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'economy'])"><i class="fas fa-globe me-2 text-success"> E</i></a></td>
                  <td title="Industry Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'industry'])"><i class="fas fa-globe me-2 text-warning"> I</i></a></td>
                  <td title="Science Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'science'])"><i class="fas fa-globe me-2 text-info"> S</i></a></td>
              </tr>
          </thead>
          <tbody>
              <natural-resources-row v-for="star in sortedFilteredTableData" v-bind:key="star._id" :star="star" @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!sortedFilteredTableData.length" class="text-center mt-2 mb-2">No stars to display.</p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import GridHelper from '../../../../services/gridHelper'
import NaturalResourcesRowVue from './NaturalResourcesRow.vue'
import SortInfo from '../../../../services/data/sortInfo'

export default {
  components: {
    'natural-resources-row': NaturalResourcesRowVue
  },
  data: function () {
    let defaultSortInfo = new SortInfo([['naturalResources', 'economy']], false);

    return {
      showAll: false,
      defaultSortInfo: defaultSortInfo,
      sortInfo: new SortInfo(defaultSortInfo.propertyPaths, defaultSortInfo.sortAscending),
      sortInfoKey: 'galaxy_naturalResources_sortInfo',
      searchFilter: ''
    }
  },
  mounted () {
    this.showAll = this.userPlayer == null;
    this.sortInfo = SortInfo.fromJSON(localStorage.getItem(this.sortInfoKey), this.defaultSortInfo);
  },
  destroyed () {
    localStorage.setItem(this.sortInfoKey, JSON.stringify(this.sortInfo));
  },
  methods: {
    toggleShowAll () {
      this.showAll = !this.showAll;
    },
    sort(...propertyPaths) {
      this.sortInfo.swapSort(propertyPaths);
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    // TODO: Move this method to a base class of the table vue components (eg StarTable.vue) once we move to Vue 3 and can use Typescript.
    missingPropertyFallbackFunc(obj, key) {
      switch (key) {
        case 'ownedByPlayer':
          return this.playersMap.get(obj.ownedByPlayerId);
        default:
          return null;
      }
    }
  },
  computed: {
    userPlayer() {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    playersMap() {
      return new Map(this.$store.state.game.galaxy.players.map(p => [p._id, p]));
    },
    tableData() {
      return this.$store.state.game.galaxy.stars;
    },
    filteredTableData() {
      let tableData = this.tableData;

      let isSearchFiltermatch = s => s.name.toLowerCase().includes(this.searchFilter.toLowerCase());

      if (!this.showAll && this.userPlayer != null) {
        tableData = tableData.filter(s => s.ownedByPlayerId === this.userPlayer._id && isSearchFiltermatch(s));
      }
      else {
        tableData = tableData.filter(isSearchFiltermatch);
      }

      return tableData;
    },
    sortedFilteredTableData() {
      return GridHelper.dynamicSort(this.filteredTableData, this.sortInfo, this.missingPropertyFallbackFunc);
    },
    isSplitResources() {
      return GameHelper.isSplitResources(this.$store.state.game);
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
