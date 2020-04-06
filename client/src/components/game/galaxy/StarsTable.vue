<template>
<div class="container">
    <div class="mb-2">
        <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">Show All Stars</button>
    </div>

    <table class="table table-striped table-hover table-bordered">
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
            <star-row v-for="star in getTableData()" v-bind:key="star._id" :star="star" :game="game"/>
        </tbody>
    </table>
</div>
</template>

<script>
import GameHelper from '../../../services/gameHelper'
import StarRowVue from './StarRow'

export default {
  components: {
    'star-row': StarRowVue
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
      
      if (this.showAll) {
        return this.game.galaxy.stars.sort(sorter)
      } else {
        return this.game.galaxy.stars.sort(sorter).filter(x => x.ownedByPlayerId === this.getUserPlayer()._id)
      }
    }
  }
}
</script>

<style scoped>
</style>
