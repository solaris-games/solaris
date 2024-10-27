<template>
<div class="container">
  <div class="row mb-2" v-if="tableData.length">
    <div class="col-6 ps-0">
      <input type="text" class="form-control form-control-sm" v-model="searchFilter" placeholder="Search...">
    </div>
  </div>

  <div class="row" v-if="tableData.length">
    <div class="table-responsive ps-0 pe-0">
      <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
              <tr>
                  <td><a href="javascript:;" @click="sort(['name'])">Name</a></td>
                  <td></td>
                  <td title="Specialist">
                    <a href="javascript:;" @click="sort(['specialist', 'name'])"><i class="fas fa-user-astronaut"></i></a>
                  </td>
                  <td v-if="!isSplitResources"><a href="javascript:;" @click="sort(['naturalResources'])">Resources</a></td>
                  <td title="Economy Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'economy'])"><i class="fas fa-globe me-2 text-success"> E</i></a></td>
                  <td title="Industry Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'industry'])"><i class="fas fa-globe me-2 text-warning"> I</i></a></td>
                  <td title="Science Resources" v-if="isSplitResources" class="text-end"><a href="javascript:;" @click="sort(['naturalResources', 'science'])"><i class="fas fa-globe me-2 text-info"> S</i></a></td>
                  <td title="Economy Infrastructure" class="text-end">
                      <a href="javascript:;" @click="sort(['infrastructure','economy'])"><i class="fas fa-money-bill-wave me-2"></i></a>
                  </td>
                  <td title="Industry Infrastructure" class="text-end">
                      <a href="javascript:;" @click="sort(['infrastructure','industry'])"><i class="fas fa-tools me-2"></i></a>
                  </td>
                  <td title="Science Infrastructure" class="text-end">
                      <a href="javascript:;" @click="sort(['infrastructure','science'])"><i class="fas fa-flask"></i></a>
                  </td>
                  <td class="last"></td>
              </tr>
          </thead>
          <tbody>
              <star-row v-for="star in sortedFilteredTableData"
                        v-bind:key="star._id"
                        :star="star"
                        @bulkIgnoreChanged="onBulkIgnoreChanged"
                        @onOpenStarDetailRequested="onOpenStarDetailRequested"
                        :highlightIgnoredInfrastructure="highlightIgnoredInfrastructure"/>
          </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import GridHelper from '../../../../services/gridHelper'
import BulkInfrastructureUpgradeStarTableRow from './BulkInfrastructureUpgradeStarTableRow.vue'
import SortInfo from '../../../../services/data/sortInfo'

export default {
  components: {
    'star-row': BulkInfrastructureUpgradeStarTableRow
  },
  props: {
      highlightIgnoredInfrastructure: String
  },
  data: function () {
    let defaultSortInfo = new SortInfo([['name']], true);

    return {
      defaultSortInfo: defaultSortInfo,
      sortInfo: new SortInfo(defaultSortInfo.propertyPaths, defaultSortInfo.sortAscending),
      searchFilter: ''
    }
  },
  methods: {
    onBulkIgnoreChanged (e) {
      this.$emit('bulkIgnoreChanged', e);
    },

    sort (...propertyPaths) {
      this.sortInfo.swapSort(propertyPaths);
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    }
  },
  computed: {
    userPlayer() {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    tableData () {
      return this.$store.state.game.galaxy.stars;
    },
    filteredTableData() {
      return this.tableData.filter(s => s.ownedByPlayerId === this.userPlayer._id && s.name.toLowerCase().includes(this.searchFilter.toLowerCase()));
    },
    sortedFilteredTableData () {
      return GridHelper.dynamicSort(this.filteredTableData, this.sortInfo);
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

td.last {
    width: 1px;
    white-space: nowrap;
}
</style>
