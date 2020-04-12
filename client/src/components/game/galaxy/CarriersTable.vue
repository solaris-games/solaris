<template>
<div class="container">
    <div class="mb-2">
        <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">Show All Carriers</button>
    </div>

    <table class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>P</td>
                <td>Name</td>
                <td></td>
                <td>Ships</td>
                <td>W</td>
                <td></td>
                <td>ETA</td>
                <td>Total ETA</td>
            </tr>
        </thead>
        <tbody>
            <carrier-row v-for="carrier in getTableData()" v-bind:key="carrier._id" :carrier="carrier" :game="game"/>
        </tbody>
    </table>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import CarrierRowVue from './CarrierRow'

export default {
  components: {
    'carrier-row': CarrierRowVue
  },
  props: {
    game: Object
  },
  data: function () {
    return {
      showAll: false
    }
  },
  methods: {
    getUserPlayer () {
      return GameHelper.getUserPlayer(this.game)
    },
    toggleShowAll () {
      this.showAll = !this.showAll
    },
    getTableData () {
      let sorter = (a, b) => a.name.localeCompare(b.name)
      
      if (this.showAll) {
        return this.game.galaxy.carriers.sort(sorter)
      } else {
        return this.game.galaxy.carriers.sort(sorter).filter(x => x.ownedByPlayerId === this.getUserPlayer()._id)
      }
    }
  }
}
</script>

<style scoped>
</style>
