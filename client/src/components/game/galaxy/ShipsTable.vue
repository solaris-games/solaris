<template>
<div class="container">
    <div class="mb-2">
        <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">Show All Ships</button>
    </div>

    <table class="table table-striped table-hover">
        <thead>
            <tr class="bg-primary">
                <td>P</td>
                <td>Name</td>
                <td></td>
                <td></td>
                <td>Ships</td>
            </tr>
        </thead>
        <tbody>
            <ship-row v-for="ship in getTableData()" v-bind:key="ship._id" :game="game" :ship="ship" />
        </tbody>
    </table>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import ShipRowVue from './ShipRow'

export default {
  components: {
    'ship-row': ShipRowVue
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
      return GameHelper.getUserPlayer(this.game, this.$store.state.userId)
    },
    toggleShowAll () {
      this.showAll = !this.showAll
    },
    getTableData () {
      let sorter = (a, b) => a.name.localeCompare(b.name)

      let starShips = this.game.galaxy.stars
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

      let carrierShips = this.game.galaxy.carriers
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
    }
  }
}
</script>

<style scoped>
</style>
