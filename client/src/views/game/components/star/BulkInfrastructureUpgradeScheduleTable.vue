<template>
<div class="container">
  <div class="row mb-2" v-if="tableData.length">
    <div class="col-6 ps-0">
      <input type="text" class="form-control form-control-sm" v-model="searchFilter" placeholder="Search...">
    </div>
  </div>
  
  <div class="row"> <!-- v-if=" .length" -->
    <div class="table-responsive ps-0 pe-0">
      <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
              <tr>
                  <td><a href="javascript:;" @click="sort(['tick'])">Tick</a></td>
                  <td><a href="javascript:;" @click="sort(['infrastructureType'])">Infrastructure</a></td>
                  <td><a href="javascript:;" @click="sort(['buyType'])">Buy type</a></td>
                  <td><a href="javascript:;" @click="sort(['amount'])">Amount</a></td>
                  <td ></td> <!-- Toggle repeat -->
                  <td class="last"></td> <!-- Trash & Confirm -->
              </tr>
          </thead>
          <tbody>
              <schedule-row v-for="action in sortedTableData" v-bind:key="action._id" :action="action"
                @repeatChanged="onRepeatChanged"
                @trashAction="onTrashAction"/>
          </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import BulkInfrastructureUpgradeScheduleTableRow from './BulkInfrastructureUpgradeScheduleTableRow'

export default {
  components: {
    'schedule-row': BulkInfrastructureUpgradeScheduleTableRow
  },
  props: {
      highlightIgnoredInfrastructure: String
  },
  data: function () {
    return {
      tableData: [],
      sortBy: 'tick',
      sortDirection: true,
      searchFilter: ''
    }
  },
  mounted () {
    this.tableData = this.getTableData()
  },
  methods: {
    onRepeatChanged (e) {
      this.$emit('bulkScheduleRepeatChanged', e);
    },
    onRepeatChanged (e) {
      this.$emit('bulkScheduleTrash', e);
    },
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    getTableData () {
      let sorter = (a, b) => a.tick - b.tick

        return this.getUserPlayer().scheduledActions.sort(sorter)
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
  },
  computed: {
    // TODO: All this stuff should be in a shared service class as it is used also on the galaxy view.
    sortedTableData () {
      // here be dragons
      const getNestedObject = (nestedObj, pathArr) => {
        return pathArr.reduce((obj, key) =>
          (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj)
      }


      if (this.sortBy == null) {
        return this.tableData
      }

      return this.tableData
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
