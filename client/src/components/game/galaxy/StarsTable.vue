<template>
<div class="container">
  <div class="mb-2">
      <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">
        <span v-if="!showAll">Show All Stars</span>
        <span v-if="showAll">Show Your Stars</span>
      </button>
  </div>

  <div class="table-responsive">
    <table class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>P</td>
                <td>Name</td>
                <td></td>
                <td>E</td>
                <td>I</td>
                <td>S</td>
                <td>$E</td>
                <td>$I</td>
                <td>$S</td>
            </tr>
        </thead>
        <tbody>
            <star-row v-for="star in tableData" v-bind:key="star._id" :star="star"/>
        </tbody>
    </table>
  </div>
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
        return this.$store.state.game.galaxy.stars.sort(sorter)
      } else {
        return this.$store.state.game.galaxy.stars.sort(sorter).filter(x => x.ownedByPlayerId === this.getUserPlayer()._id)
      }
    }
  }
}
</script>

<style scoped>
</style>
