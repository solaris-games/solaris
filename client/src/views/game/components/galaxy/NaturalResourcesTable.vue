<template>
<div class="container">
  <div class="row mb-2 g-0">
    <div class="col-auto">
      <button class="btn btn-sm" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll" v-if="getUserPlayer()">
        <span v-if="!showAll">Show All</span>
        <span v-if="showAll">Show Yours</span>
      </button>
    </div>
    <div class="col ms-2 me-2">
      <input type="text" class="form-control form-control-sm" v-model="searchFilter" placeholder="Search...">
    </div>
  </div>

  <div class="row">
    <div class="table-responsive">
      <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
              <tr>
                  <td><i class="fas fa-user"></i></td>
                  <td><a href="javascript:;" @click="sort(['ships'])">Name</a></td>
                  <td></td>
                  <td></td>
                  <td class="text-end">
                    <span class="infrastructure-filters">
                      <a href="javascript:;" @click="sort(['infrastructure','economy'])"><i class="fas fa-money-bill-wave me-2"></i></a>
                      <a href="javascript:;" @click="sort(['infrastructure','industry'])"><i class="fas fa-tools me-2"></i></a>
                      <a href="javascript:;" @click="sort(['infrastructure','science'])"><i class="fas fa-flask"></i></a>
                    </span>
                  </td>
                  <td class="text-end"><a href="javascript:;" @click="sort(['naturalResources','economy'])">Resources</a></td>
              </tr>
          </thead>
          <tbody>
              <natural-resources-row v-for="star in sortedTableData" v-bind:key="star._id" :star="star" @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!tableData.length" class="text-center mt-2 mb-2">No stars to display.</p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import NaturalResourcesRowVue from './NaturalResourcesRow'

export default {
  components: {
    'natural-resources-row': NaturalResourcesRowVue
  },
  data: function () {
    return {
      showAll: false,
      tableData: [],
      sortBy: ['naturalResources','economy'],
      sortDirection: false,
      searchFilter: ''
    }
  },
  mounted () {
    this.showAll = this.getUserPlayer() == null
    this.tableData = this.getTableData()
    
    this.sortBy = localStorage.getItem('galaxy_naturalResources_sortBy') || null
    this.sortDirection = localStorage.getItem('galaxy_naturalResources_sortDirection') == 'true' || false
  },
  destroyed () {
    localStorage.setItem('galaxy_naturalResources_sortBy', this.sortBy)
    localStorage.setItem('galaxy_naturalResources_sortDirection', this.sortDirection)
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
        return this.$store.state.game.galaxy.stars.sort(sorter)
      } else {
        return this.$store.state.game.galaxy.stars.sort(sorter).filter(x => x.ownedByPlayerId === this.getUserPlayer()._id)
      }
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
</style>
