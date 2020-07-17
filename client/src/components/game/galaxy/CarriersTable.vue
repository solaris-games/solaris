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
                  <td>P</td>
                  <td>Name</td>
                  <td></td>
                  <td class="text-right">Ships</td>
                  <td class="text-right">W</td>
                  <td></td>
                  <td>ETA</td>
                  <!-- <td>Total ETA</td> -->
              </tr>
          </thead>
          <tbody>
              <carrier-row v-for="carrier in tableData" v-bind:key="carrier._id" :carrier="carrier"/>
          </tbody>
      </table>
  </div>
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
      tableData: []
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
    }
  }
}
</script>

<style scoped>
</style>
