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
                  <td class="text-end" title="Scanning"><a href="javascript:;" @click="sort('scanning')"><i class="fas fa-binoculars"></i></a></td>
                  <td class="text-end" title="Hyperspace"><a href="javascript:;" @click="sort('hyperspace')"><i class="fas fa-gas-pump"></i></a></td>
                  <td class="text-end" title="Terraforming"><a href="javascript:;" @click="sort('terraforming')"><i class="fas fa-globe-europe"></i></a></td>
                  <td class="text-end" title="Experimentation"><a href="javascript:;" @click="sort('experimentation')"><i class="fas fa-microscope"></i></a></td>
                  <td class="text-end" title="Weapons"><a href="javascript:;" @click="sort('weapons')"><i class="fas fa-gun"></i></a></td>
                  <td class="text-end" title="Banking"><a href="javascript:;" @click="sort('banking')"><i class="fas fa-money-bill-alt"></i></a></td>
                  <td class="text-end" title="Manufacturing"><a href="javascript:;" @click="sort('manufacturing')"><i class="fas fa-industry"></i></a></td>
                  <td class="text-end" title="Specialists"><a href="javascript:;" @click="sort('specialists')"><i class="fas fa-user-astronaut"></i></a></td>
              </tr>
          </thead>
          <tbody>
              <technology-row v-for="technology in sortedTableData" v-bind:key="technology._id" :technology="technology"
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
import TechnologyRowVue from './TechnologyRow'

export default {
  components: {
    'technology-row': TechnologyRowVue
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
    
    this.sortBy = localStorage.getItem('galaxy_technology_sortBy') || null
    this.sortDirection = localStorage.getItem('galaxy_technology_sortDirection') == 'true' || false
  },
  destroyed () {
    localStorage.setItem('galaxy_technology_sortBy', this.sortBy)
    localStorage.setItem('galaxy_technology_sortDirection', this.sortDirection)
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
        if (x.research) {
          return {
            _id: x._id,
            alias: x.alias,
            defeated: x.defeated,
            scanning: x.research.scanning.level,
            hyperspace: x.research.hyperspace.level,
            terraforming: x.research.terraforming.level,
            experimentation: x.research.experimentation.level,
            weapons: x.research.weapons.level,
            banking: x.research.banking.level,
            manufacturing: x.research.manufacturing.level,
            specialists: x.research.specialists.level
          }
        }

        return {
            _id: x._id,
            alias: x.alias,
            defeated: x.defeated,
            scanning: null,
            hyperspace: null,
            terraforming: null,
            experimentation: null,
            weapons: null,
            banking: null,
            manufacturing: null,
            specialists: null
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
