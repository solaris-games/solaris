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
                <td>Name</td>
                <td></td>
                <td class="text-right"><i class="fas fa-money-bill-wave"></i></td>
                <td class="text-right"><i class="fas fa-tools"></i></td>
                <td class="text-right"><i class="fas fa-flask"></i></td>
                <td class="text-right">$E</td>
                <td class="text-right">$I</td>
                <td class="text-right">$S</td>
            </tr>
        </thead>
        <tbody>
            <star-row v-for="star in tableData" v-bind:key="star._id" :star="star" :allowUpgrades="allowUpgrades"
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
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    }
  }
}
</script>

<style scoped>
</style>
