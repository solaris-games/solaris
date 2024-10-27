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
                  <td class="text-end" title="Scanning"><a href="javascript:;" @click="sort(['scanning'])"><i class="fas fa-binoculars"></i></a></td>
                  <td class="text-end" title="Hyperspace"><a href="javascript:;" @click="sort(['hyperspace'])"><i class="fas fa-gas-pump"></i></a></td>
                  <td class="text-end" title="Terraforming"><a href="javascript:;" @click="sort(['terraforming'])"><i class="fas fa-globe-europe"></i></a></td>
                  <td class="text-end" title="Experimentation"><a href="javascript:;" @click="sort(['experimentation'])"><i class="fas fa-microscope"></i></a></td>
                  <td class="text-end" title="Weapons"><a href="javascript:;" @click="sort(['weapons'])"><i class="fas fa-gun"></i></a></td>
                  <td class="text-end" title="Banking"><a href="javascript:;" @click="sort(['banking'])"><i class="fas fa-money-bill-alt"></i></a></td>
                  <td class="text-end" title="Manufacturing"><a href="javascript:;" @click="sort(['manufacturing'])"><i class="fas fa-industry"></i></a></td>
                  <td class="text-end" title="Specialists"><a href="javascript:;" @click="sort(['specialists'])"><i class="fas fa-user-astronaut"></i></a></td>
              </tr>
          </thead>
          <tbody>
              <technology-row v-for="technology in sortedFilteredTableData"
                              v-bind:key="technology._id"
                              :technology="technology"
                              :userPlayer="userPlayer"
                              @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!sortedFilteredTableData.length" class="text-center mt-2 mb-2">No empires to display.</p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import GridHelper from '../../../../services/gridHelper'
import SortInfo from '../../../../services/data/sortInfo'
import TechnologyRowVue from './TechnologyRow.vue'

export default {
  components: {
    'technology-row': TechnologyRowVue
  },
  data: function () {
    let defaultSortInfo = new SortInfo([['alias']], true);

    return {
      showAll: false,
      defaultSortInfo: defaultSortInfo,
      sortInfo: new SortInfo(defaultSortInfo.propertyPaths, defaultSortInfo.sortAscending),
      sortInfoKey: 'galaxy_technology_sortInfo',
      searchFilter: ''
    }
  },
  mounted () {
    this.showAll = this.userPlayer != null
    this.sortInfo = SortInfo.fromJSON(localStorage.getItem(this.sortInfoKey), this.defaultSortInfo);
  },
  destroyed () {
    localStorage.setItem(this.sortInfoKey, JSON.stringify(this.sortInfo));
  },
  methods: {
    toggleShowAll () {
      this.showAll = !this.showAll
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
    },
    sort(...propertyPaths) {
      this.sortInfo.swapSort(propertyPaths);
    }
  },
  computed: {
    userPlayer() {
      return GameHelper.getUserPlayer(this.$store.state.game);
    },
    tableData () {
      let tableData = this.$store.state.game.galaxy.players.map(p => {
        if (p.research) {
          return {
            _id: p._id,
            alias: p.alias,
            defeated: p.defeated,
            scanning: p.research.scanning.level,
            hyperspace: p.research.hyperspace.level,
            terraforming: p.research.terraforming.level,
            experimentation: p.research.experimentation.level,
            weapons: p.research.weapons.level,
            banking: p.research.banking.level,
            manufacturing: p.research.manufacturing.level,
            specialists: p.research.specialists.level
          }
        }

        return {
          _id: p._id,
          alias: p.alias,
          defeated: p.defeated,
          scanning: null,
          hyperspace: null,
          terraforming: null,
          experimentation: null,
          weapons: null,
          banking: null,
          manufacturing: null,
          specialists: null
        }
      });

      return tableData;
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
