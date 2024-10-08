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
                  <td class="text-end" title="Stars"><a href="javascript:;" @click="sort(['totalStars'])"><i class="fas fa-star"></i></a></td>
                  <td class="text-end" title="Carriers"><a href="javascript:;" @click="sort(['totalCarriers'])"><i class="fas fa-rocket"></i></a></td>
                  <td class="text-end" title="Specialists"><a href="javascript:;" @click="sort(['totalSpecialists'])"><i class="fas fa-user-astronaut"></i></a></td>
                  <td class="text-end" title="Ships"><a href="javascript:;" @click="sort(['totalShips'])">S</a></td>
                  <td class="text-end" title="Ship Production"><a href="javascript:;" @click="sort(['newShips'])"><i class="fas fa-industry"></i></a></td>
                  <td class="text-end" title="Economy Infrastructure"><a href="javascript:;" @click="sort(['totalEconomy'])"><i class="fas fa-money-bill-wave"></i></a></td>
                  <td class="text-end" title="Industry Infrastructure"><a href="javascript:;" @click="sort(['totalIndustry'])"><i class="fas fa-tools"></i></a></td>
                  <td class="text-end" title="Science Infrastructure"><a href="javascript:;" @click="sort(['totalScience'])"><i class="fas fa-flask"></i></a></td>
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

<script>
import EmpireRowVue from './EmpireRow.vue'
import GameHelper from '../../../../services/gameHelper'
import GridHelper from '../../../../services/gridHelper'
import SortInfo from '../../../../services/data/sortInfo'

export default {
  components: {
    'empire-row': EmpireRowVue
  },
  data: function () {
    let defaultSortInfo = new SortInfo([['alias']], true);

    return {
      showAll: false,
      defaultSortInfo: defaultSortInfo,
      sortInfo: new SortInfo(defaultSortInfo.propertyPaths, defaultSortInfo.sortAscending),
      sortInfoKey: 'galaxy_empires_sortInfo',
      searchFilter: ''
    }
  },
  mounted () {
    this.showAll = this.userPlayer != null;
    this.sortInfo = SortInfo.fromJSON(localStorage.getItem(this.sortInfoKey), this.defaultSortInfo);
  },
  destroyed () {
    localStorage.setItem(this.sortInfoKey, JSON.stringify(this.sortInfo));
  },
  methods: {
    toggleShowAll () {
      this.showAll = !this.showAll;
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    sort (...propertyPaths) {
      this.sortInfo.swapSort(propertyPaths);
    }
  },
  computed: {
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    tableData () {
      return this.$store.state.game.galaxy.players.map(p => {
        return {
          _id: p._id,
          alias: p.alias,
          defeated: p.defeated,
          ...p.stats
        }
      });
    },
    filteredTableData() {
      let tableData = this.tableData;

      let isSearchFilterMatch = p => p.alias.toLowerCase().includes(this.searchFilter.toLowerCase());

      if (!this.showAll && this.userPlayer != null) {
        tableData = tableData.filter(p => p._id === this.userPlayer._id && isSearchFilterMatch(p));
      }
      else {
        tableData = tableData.filter(isSearchFilterMatch);
      }

      return tableData;
    },
    sortedFilteredTableData () {
      return GridHelper.dynamicSort(this.filteredTableData, this.sortInfo);
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
