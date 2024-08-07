<template>
<div class="container">
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
                @bulkScheduleTrashed="onTrashed"/>
          </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import BulkInfrastructureUpgradeScheduleTableRow from './BulkInfrastructureUpgradeScheduleTableRow.vue'

export default {
  components: {
    'schedule-row': BulkInfrastructureUpgradeScheduleTableRow
  },
  props: {
      highlightIgnoredInfrastructure: String
  },
  data: function () {
    return {
      sortBy: null,
      sortDirection: true,
    }
  },
  methods: {
    onTrashed () {
      this.$emit('bulkScheduleTrashed')
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
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    tableData () {
      return this.userPlayer.scheduledActions
    },
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
  padding: 20px 6px !important;
}

.infrastructure-filters {
  white-space: pre;
}

td.last {
    width: 1px;
    white-space: nowrap;
}
</style>
