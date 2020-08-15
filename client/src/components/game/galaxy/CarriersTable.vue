<template>
<div class="container">
  <div class="mb-2">
      <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">
        <span v-if="!showAll">Show All Carriers</span>
        <span v-if="showAll">Show Your Carriers</span>
      </button>
  </div>

  <div class="table-responsive">
      <table class="table table-striped table-hover">
          <thead>
              <tr class="bg-primary">
                  <td><i class="fas fa-user"></i></td>
                  <td><a href="javascript:;" @click="sort('name')">Name</a></td>
                  <td></td>
                  <td class="text-right"><a href="javascript:;" @click="sort('ships')"><i class="fas fa-rocket"></i></a></td>
                  <td class="text-right"><i class="fas fa-map-marker-alt"></i></td>
                  <td></td>
                  <td>ETA</td>
                  <!-- <td>Total ETA</td> -->
              </tr>
          </thead>
          <tbody>
              <carrier-row v-for="carrier in sortedTableData" v-bind:key="carrier._id" :carrier="carrier"
                @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
          </tbody>
      </table>
  </div>

  <p v-if="!tableData.length" class="text-center">You have no carriers.</p>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import CarrierRowVue from './CarrierRow'

export default {
  components: {
    'carrier-row': CarrierRowVue
  },
  data: function () {
    return {
      showAll: false,
      tableData: [],
      sortBy: null,
      sortDirection: true
    }
  },
  mounted () {
    this.tableData = this.getTableData()
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    toggleShowAll () {
      this.showAll = !this.showAll

      this.tableData = this.getTableData()
    },
    getTableData () {
      let sorter = (a, b) => a.name.localeCompare(b.name)
      
      if (this.showAll) {
        return this.$store.state.game.galaxy.carriers.sort(sorter)
      } else {
        return this.$store.state.game.galaxy.carriers.sort(sorter).filter(x => x.ownedByPlayerId === this.getUserPlayer()._id)
      }
    },
    onOpenCarrierDetailRequested (e) {
      this.$emit('onOpenCarrierDetailRequested', e)
    },
    sort (columnName) {
      // If sorting by a new column, reset the sort.
      if (this.sortBy !== columnName) {
        this.sortBy = columnName
        this.sortDirection = true
      } else {
        // Otherwise if we are sorting by the same column, flip the sort direction.
        this.sortDirection = !this.sortDirection
      }
    }
  },
  computed: {
    sortedTableData () {
      if (this.sortBy == null) {
        return this.tableData
      }

      return this.tableData.sort((a, b) => {
        if (this.sortDirection) { // Ascending
          return b[this.sortBy] < a[this.sortBy] ? 1 : -1
        }

        // Descending
        return a[this.sortBy] <= b[this.sortBy] ? 1 : -1
      })
    }
  }
}
</script>

<style scoped>
</style>
