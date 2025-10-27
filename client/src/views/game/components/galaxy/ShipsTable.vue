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

<script>
import GameHelper from '../../../../services/gameHelper'
import GridHelper from '../../../../services/gridHelper'
import ShipRowVue from './ShipRow.vue'
import SortInfo from '../../../../services/data/sortInfo'

export default {
  components: {
    'ship-row': ShipRowVue
  },
  data: function () {
    let defaultSortInfo = new SortInfo([['name']], true);

    return {
      showAll: false,
      defaultSortInfo: defaultSortInfo,
      sortInfo: new SortInfo(defaultSortInfo.propertyPaths, defaultSortInfo.sortAscending),
      sortInfoKey: 'galaxy_ships_sortInfo',
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
      this.showAll = !this.showAll
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', e)
    },
    sort(...propertyPaths) {
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
    userPlayer() {
      return GameHelper.getUserPlayer(this.$store.state.game);
    },
    playersMap() {
      return new Map(this.$store.state.game.galaxy.players.map(p => [p._id, p]));
    },
    tableData () {
      let starShips = this.$store.state.game.galaxy.stars
        .filter(s => s.ships)
        .map(s => {
          return {
            _id: s._id,
            ownedByPlayerId: s.ownedByPlayerId,
            name: s.name,
            ships: s.ships,
            type: 0,
            location: s.location,
            specialist: s.specialist
          }
        });

      let carrierShips = this.$store.state.game.galaxy.carriers
        .filter(s => s.ships)
        .map(c => {
          return {
            _id: c._id,
            ownedByPlayerId: c.ownedByPlayerId,
            name: c.name,
            ships: c.ships,
            type: 1,
            location: c.location,
            specialist: c.specialist
          }
        });

      return starShips.concat(carrierShips);
    },
    filteredTableData() {
      let tableData = this.tableData;

      let isSearchFilterMatch = v => v.name.toLowerCase().includes(this.searchFilter.toLowerCase());

      if (!this.showAll && this.userPlayer != null) {
        tableData = tableData.filter(v => v.ownedByPlayerId === this.userPlayer._id && isSearchFilterMatch(v));
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
