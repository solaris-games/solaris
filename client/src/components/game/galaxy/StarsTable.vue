<template>
<div class="container">
  <div class="row mb-2">
    <div class="col">
      <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">
        <span v-if="!showAll">Show All Stars</span>
        <span v-if="showAll">Show Your Stars</span>
      </button>
    </div>
    <div class="col-auto">
      <select class="form-control" v-model="allowUpgrades">
        <option :value="true">Enable Upgrades</option>
        <option :value="false">Disable Upgrades</option>
      </select>
    </div>
  </div>
  
  <div class="table-responsive">
    <table class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td><i class="fas fa-user"></i></td>
                <td><a href="javascript:;" @click="sort(['ships'])">Name</a></td>
                <td></td>
                <td class="text-right"><a href="javascript:;" @click="sort(['infrastructure','economy'])"><i class="fas fa-money-bill-wave"></i></a></td>
                <td class="text-right"><a href="javascript:;" @click="sort(['infrastructure','industry'])"><i class="fas fa-tools"></i></a></td>
                <td class="text-right"><a href="javascript:;" @click="sort(['infrastructure','science'])"><i class="fas fa-flask"></i></a></td>
                <td class="text-right"><a href="javascript:;" @click="sort(['upgradeCosts','economy'])">$E</a></td>
                <td class="text-right"><a href="javascript:;" @click="sort(['upgradeCosts','industry'])">$I</a></td>
                <td class="text-right"><a href="javascript:;" @click="sort(['upgradeCosts','science'])">$S</a></td>
            </tr>
        </thead>
        <tbody>
            <star-row v-for="star in sortedTableData" v-bind:key="star._id" :star="star" :allowUpgrades="allowUpgrades"
              @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
        </tbody>
    </table>
  </div>

  <p v-if="!tableData.length" class="text-center">You have no stars.</p>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import StarRowVue from './StarRow'

export default {
  components: {
    'star-row': StarRowVue
  },
  data: function () {
    return {
      showAll: false,
      allowUpgrades: true,
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
        return pathArr.reduce((obj, key) =>
            (obj && obj[key] !== 'undefined') ? obj[key] : -1, nestedObj);
      }

      if (this.sortBy == null) {
        return this.tableData
      }

      return this.tableData.sort((a, b) => {
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
</style>
