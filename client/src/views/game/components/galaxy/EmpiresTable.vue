<template>
<div class="container">
  <div class="row mb-2 g-0">
    <div class="col-auto">
      <button class="btn btn-sm" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll" v-if="getUserPlayer()">
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
                  <td><i class="fas fa-user"></i></td>
                  <td><a href="javascript:;" @click="sort('alias')">Name</a></td>
                  <td></td>
                  <td class="text-end" title="Stars"><a href="javascript:;" @click="sort('totalStars')"><i class="fas fa-star"></i></a></td>
                  <td class="text-end" title="Carriers"><a href="javascript:;" @click="sort('totalCarriers')"><i class="fas fa-rocket"></i></a></td>
                  <td class="text-end" title="Specialists"><a href="javascript:;" @click="sort('totalSpecialists')"><i class="fas fa-user-astronaut"></i></a></td>
                  <td class="text-end" title="Ships"><a href="javascript:;" @click="sort('totalShips')">S</a></td>
                  <td class="text-end" title="Ship Production"><a href="javascript:;" @click="sort('newShips')"><i class="fas fa-industry"></i></a></td>
                  <td class="text-end" title="Economy"><a href="javascript:;" @click="sort('totalEconomy')"><i class="fas fa-money-bill-wave"></i></a></td>
                  <td class="text-end" title="Industry"><a href="javascript:;" @click="sort('totalIndustry')"><i class="fas fa-tools"></i></a></td>
                  <td class="text-end" title="Science"><a href="javascript:;" @click="sort('totalScience')"><i class="fas fa-flask"></i></a></td>
              </tr>
          </thead>
          <tbody>
              <empire-row v-for="empire in sortedTableData" v-bind:key="empire._id" :empire="empire"
                @onOpenPlayerDetailRequested="onOpenPlayerDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!tableData.length" class="text-center mt-2 mb-2">No empires to display.</p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import EmpireRowVue from './EmpireRow'

export default {
  components: {
    'empire-row': EmpireRowVue
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
    this.showAll = this.getUserPlayer() != null
    this.tableData = this.getTableData()
    
    this.sortBy = localStorage.getItem('galaxy_empires_sortBy') || null
    this.sortDirection = localStorage.getItem('galaxy_empires_sortDirection') == 'true' || false
  },
  destroyed () {
    localStorage.setItem('galaxy_empires_sortBy', this.sortBy)
    localStorage.setItem('galaxy_empires_sortDirection', this.sortDirection)
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
      let sorter = (a, b) => a.alias.localeCompare(b.alias)

      let data = this.$store.state.game.galaxy.players.map(x => {
        return {
          _id: x._id,
          alias: x.alias,
          defeated: x.defeated,
          ...x.stats
        }
      })

      if (this.showAll || !this.getUserPlayer()) {
        return data.sort(sorter)
      } else {
        return data.filter(x => x._id === this.getUserPlayer()._id).sort(sorter)
      }
    },
    onOpenPlayerDetailRequested (e) {
      this.$emit('onOpenPlayerDetailRequested', e)
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
      let filterFunction = a => a.alias.toLowerCase().includes(this.searchFilter.toLowerCase())

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
