<template>
<div class="container">
  <div class="row mb-2 g-0">
    <div class="col-auto">
      <button class="btn btn-sm" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll" v-if="getUserPlayer()">
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
                    <td><i class="fas fa-user"></i></td>
                    <td><a href="javascript:;" @click="sort(['name'])">Name</a></td>
                    <td></td>
                    <td></td>
                    <td class="text-end"><a href="javascript:;" @click="sort(['ships'])"><i class="fas fa-rocket"></i></a></td>
                    <td class="text-end"><a href="javascript:;" @click="sort(['waypoints', 'length'])"><i class="fas fa-map-marker-alt"></i></a></td>
                    <!-- <td></td> -->
                    <td class="text-end"><a href="javascript:;" @click="sort(['ticksEta'])">ETA</a></td>
                    <td class="text-end"><a href="javascript:;" @click="sort(['ticksEtaTotal'])">Total</a></td>
                </tr>
            </thead>
            <tbody>
                <carrier-row v-for="carrier in sortedTableData" v-bind:key="carrier._id" :carrier="carrier"
                  @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
            </tbody>
        </table>
    </div>
  </div>

  <p v-if="!tableData.length" class="text-center mt-2 mb-2">No carriers to display.</p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import CarrierRowVue from './CarrierRow'

export default {
  components: {
    'carrier-row': CarrierRowVue
  },
  data: function () {
    return {
      showAll: false,
      tableData: [],
      sortBy: ['ticksEta'],
      sortDirection: true,
      searchFilter: ''
    }
  },
  mounted () {
    this.showAll = this.getUserPlayer() == null
    this.tableData = this.getTableData()
    
    this.sortBy = localStorage.getItem('galaxy_carriers_sortBy') || null
    this.sortDirection = localStorage.getItem('galaxy_carriers_sortDirection') == 'true' || false
  },
  destroyed () {
    localStorage.setItem('galaxy_carriers_sortBy', this.sortBy)
    localStorage.setItem('galaxy_carriers_sortDirection', this.sortDirection)
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

      if (this.showAll || !this.getUserPlayer()) {
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
      if (JSON.stringify(this.sortBy) !== JSON.stringify(columnName)) {
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
      // here be dragons
      const getNestedObject = (nestedObj, pathArr) => {
        if (!Array.isArray(pathArr)) {
          pathArr = pathArr.split(',')
        }

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
          if (this.sortDirection) { // Ascending
            return getNestedObject(b, this.sortBy) < getNestedObject(a, this.sortBy) ? 1 : -1
          }

          // Descending
          return getNestedObject(a, this.sortBy) <= getNestedObject(b, this.sortBy) ? 1 : -1
        })
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
