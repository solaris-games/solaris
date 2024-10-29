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

<script>
import GameHelper from '../../../../services/gameHelper'
import GridHelper from '../../../../services/gridHelper'
import CarrierRowVue from './CarrierRow.vue'
import SortInfo from '../../../../services/data/sortInfo'

export default {
  components: {
    'carrier-row': CarrierRowVue
  },
  data: function () {
    let defaultSortInfo = new SortInfo([['ticksEta']], true);

    return {
      showAll: false,
      defaultSortInfo: defaultSortInfo,
      sortInfo: new SortInfo(defaultSortInfo.propertyPaths, defaultSortInfo.sortAscending),
      sortInfoKey: 'galaxy_carriers_sortInfo',
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

    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', e)
    },
    sort (...propertyPaths) {
      this.sortInfo.swapSort(propertyPaths);
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
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game);
    },
    playersMap() {
      return new Map(this.$store.state.game.galaxy.players.map(p => [p._id, p]));
    },
    tableData () {
      return this.$store.state.game.galaxy.carriers;
    },
    filteredTableData() {
      let tableData = this.tableData;

      let isSearchFilterMatch = c => c.name.toLowerCase().includes(this.searchFilter.toLowerCase());

      if (!this.showAll && this.userPlayer != null) {
        tableData = tableData.filter(c => c.ownedByPlayerId === this.userPlayer._id && isSearchFilterMatch(c));
      }
      else {
        tableData = tableData.filter(isSearchFilterMatch);
      }

      return tableData;
    },
    sortedFilteredTableData () {
      return GridHelper.dynamicSort(this.filteredTableData, this.sortInfo, this.missingPropertyFallbackFunc);
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
