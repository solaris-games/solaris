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
                <td>P</td>
                <td>Name</td>
                <td></td>
                <td></td>
                <td class="text-right">Ships</td>
            </tr>
        </thead>
        <tbody>
            <ship-row v-for="ship in tableData" v-bind:key="ship._id" :ship="ship"
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
    }
  }
}
</script>

<style scoped>
</style>
