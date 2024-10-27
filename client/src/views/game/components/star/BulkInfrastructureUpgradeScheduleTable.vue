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
              <schedule-row v-for="action in sortedTableData"
                            v-bind:key="action._id"
                            :action="action"
                            @bulkScheduleTrashed="onTrashed"/>
          </tbody>
      </table>
    </div>
  </div>
</div>
</template>

<script>
import BulkInfrastructureUpgradeScheduleTableRow from './BulkInfrastructureUpgradeScheduleTableRow.vue'
import GameHelper from '../../../../services/gameHelper'
import GridHelper from '../../../../services/gridHelper'
import SortInfo from '../../../../services/data/sortInfo'

export default {
  components: {
    'schedule-row': BulkInfrastructureUpgradeScheduleTableRow
  },
  props: {
      highlightIgnoredInfrastructure: String
  },
  data: function () {
    return {
      sortInfo: new SortInfo(null, true)
    }
  },
  methods: {
    onTrashed () {
      this.$emit('bulkScheduleTrashed')
    },
    sort(...propertyPaths) {
      this.swapSort(propertyPaths);
    },
  },
  computed: {
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    tableData () {
      return this.userPlayer.scheduledActions
    },
    sortedTableData () {
      return GridHelper.dynamicSort(this.tableData, this.sortInfo);
    }
  }
}
</script>

<style scoped>
td {
  padding: 20px 6px !important;
}

td.last {
    width: 1px;
    white-space: nowrap;
}
</style>
