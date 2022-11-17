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
                  <td><a href="javascript:;" @click="sort('name')">Name</a></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td class="text-end"><a href="javascript:;" @click="sort('ships')"><i class="fas fa-rocket"></i></a></td>
              </tr>
          </thead>
          <tbody>
              <ship-row v-for="ship in sortedTableData" v-bind:key="ship._id" :ship="ship"
                @onOpenStarDetailRequested="onOpenStarDetailRequested"
                @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!tableData.length" class="text-center mt-2 mb-2">No ships to display.</p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import ShipRowVue from './ShipRow'

export default {
  components: {
    'ship-row': ShipRowVue
  },
  data: function () {
    return {
      showAll: false,
      tableData: [],
      sortBy: null,
      sortDirection: true,
      searchFilter: ''
    }
  },
  mounted () {
    this.showAll = this.getUserPlayer() == null
    this.tableData = this.getTableData()
    
    this.sortBy = localStorage.getItem('galaxy_ships_sortBy') || null
    this.sortDirection = localStorage.getItem('galaxy_ships_sortDirection') == 'true' || false
  },
  destroyed () {
    localStorage.setItem('galaxy_ships_sortBy', this.sortBy)
    localStorage.setItem('galaxy_ships_sortDirection', this.sortDirection)
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
        })

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
        })

      let allShips = starShips.concat(carrierShips).sort(sorter)

      if (this.showAll || !this.getUserPlayer()) {
        return allShips
      } else {
        return allShips.filter(x => x.ownedByPlayerId === this.getUserPlayer()._id)
      }
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
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
      let filterFunction = a => a.name.toLowerCase().includes(this.searchFilter.toLowerCase())

      if (this.sortBy == null) {
        return this.tableData.filter(filterFunction)
      }

      return this.tableData
        .filter(filterFunction)
        .sort((a, b) => {
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
td {
  padding: 12px 6px !important;
}
</style>
