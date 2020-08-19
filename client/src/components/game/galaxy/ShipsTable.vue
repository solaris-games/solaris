<template>
<div class="container">
  <div class="mb-2">
      <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">
        <span v-if="!showAll">Show All Ships</span>
        <span v-if="showAll">Show Your Ships</span>
      </button>
  </div>

  <div class="table-responsive">
    <table class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td><i class="fas fa-user"></i></td>
                <td><a href="javascript:;" @click="sort('name')">Name</a></td>
                <td></td>
                <td></td>
                <td class="text-right"><a href="javascript:;" @click="sort('ships')"><i class="fas fa-rocket"></i></a></td>
            </tr>
        </thead>
        <tbody>
            <ship-row v-for="ship in sortedTableData" v-bind:key="ship._id" :ship="ship"
              @onOpenStarDetailRequested="onOpenStarDetailRequested"
              @onOpenCarrierDetailRequested="onOpenCarrierDetailRequested"/>
        </tbody>
    </table>
  </div>

  <p v-if="!tableData.length" class="text-center">You have no ships.</p>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
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

      let starShips = this.$store.state.game.galaxy.stars
        .filter(s => s.garrison)
        .map(s => {
          return {
            _id: s._id,
            ownedByPlayerId: s.ownedByPlayerId,
            name: s.name,
            ships: s.garrison,
            type: 0,
            location: s.location
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
            location: c.location
          }
        })

      let allShips = starShips.concat(carrierShips).sort(sorter)

      if (this.showAll) {
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
td {
  padding: 12px 6px !important;
}
</style>
