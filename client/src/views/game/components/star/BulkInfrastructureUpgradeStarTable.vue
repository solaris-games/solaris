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
                  <td><a href="javascript:;" @click="sort(['ships'])">Name</a></td>
                  <td></td>
                  <td></td>
                  <td class="text-end">Resources</td>
                  <td class="text-end">
                    <span class="infrastructure-filters">
                      <a href="javascript:;" @click="sort(['infrastructure','economy'])"><i class="fas fa-money-bill-wave me-2"></i></a>
                      <a href="javascript:;" @click="sort(['infrastructure','industry'])"><i class="fas fa-tools me-2"></i></a>
                      <a href="javascript:;" @click="sort(['infrastructure','science'])"><i class="fas fa-flask"></i></a>
                    </span>
                  </td>
                  <td class="last"></td>
              </tr>
          </thead>
          <tbody>
              <star-row v-for="star in sortedTableData" v-bind:key="star._id" :star="star"
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
import BulkInfrastructureUpgradeStarTableRow from './BulkInfrastructureUpgradeStarTableRow'

export default {
  components: {
    'star-row': BulkInfrastructureUpgradeStarTableRow
  },
  props: {
      highlightIgnoredInfrastructure: String
  },
  data: function () {
    return {
      tableData: [],
      sortBy: null,
      sortDirection: true,
      searchFilter: ''
    }
  },
  mounted () {
    this.tableData = this.getTableData()
  },
  methods: {
    onBulkIgnoreChanged (e) {
      this.$emit('bulkIgnoreChanged', e);
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getTableData () {
      let sorter = (a, b) => a.name.localeCompare(b.name)

        return this.$store.state.game.galaxy.stars.sort(sorter).filter(x => x.ownedByPlayerId === this.getUserPlayer()._id)
    },
    sort (columnName) {
      // If sorting by a new column, reset the sort.
      if (JSON.stringify(this.sortBy) !== JSON.stringify(columnName)) {
        this.sortBy = columnName
        this.sortDirection = true
      } else {
        // Otherwise if we are sorting by the same column, flip the sort direction.
        this.sortDirection = !this.sortDirection
      }
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    }
  },
  computed: {
    // TODO: All this stuff should be in a shared service class as it is used also on the galaxy view.
    sortedTableData () {
      // here be dragons
      const getNestedObject = (nestedObj, pathArr) => {
        return pathArr.reduce((obj, key) =>
          (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
      }

      let filterFunction = a => a.name.toLowerCase().includes(this.searchFilter.toLowerCase())

      if (this.sortBy == null) {
        return this.tableData.filter(filterFunction)
      }

      return this.tableData
        .filter(filterFunction)
        .sort((a, b) => {
          let bo = getNestedObject(b, this.sortBy)
          let ao = getNestedObject(a, this.sortBy)

          // equal items sort equally
          if (ao === bo) {
              return 0;
          }
          // nulls sort after anything else
          else if (ao === null) {
              return 1;
          }
          else if (bo === null) {
              return -1;
          }
          // otherwise, if we're ascending, lowest sorts first
          else if (this.sortDirection) {
              return ao < bo ? -1 : 1;
          }
          // if descending, highest sorts first
          else { 
              return ao < bo ? 1 : -1;
          }
        })
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}

.infrastructure-filters {
  white-space: pre;
}

td.last {
    width: 1px;
    white-space: nowrap;
}
</style>
