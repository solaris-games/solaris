<template>
<div class="container">
  <div class="row mb-2 g-0">
    <div class="col-auto">
      <button class="btn btn-sm" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll" v-if="userPlayer != null">
        <span v-if="!showAll">Show All</span>
        <span v-if="showAll">Show Yours</span>
      </button>
    </div>
    <div class="col ms-2 me-2">
      <input type="text" class="form-control form-control-sm" v-model="searchFilter" placeholder="Search...">
    </div>
    <div class="col-auto pt-1" v-if="!isGameFinished && userPlayer != null">
      <input class="me-1" type="checkbox" v-model="allowUpgrades" id="chkEnableUpgrades">
      <label for="chkEnableUpgrades">
        Upgrades
      </label>
    </div>
  </div>

  <div class="row">
    <div class="table-responsive">
      <table class="table table-striped table-hover mb-0">
          <thead class="table-dark">
              <tr>
                  <td title="Player"><a href="javascript:;" @click="sort(['ownedByPlayer','alias'], ['ownedByPlayerId'], ['name'])"><i class="fas fa-user"></i></a></td>
                  <td><a href="javascript:;" @click="sort(['name'])">Name</a></td>
                  <td></td>
                  <td title="Specialist">
                    <a href="javascript:;" @click="sort(['specialist', 'name'])"><i class="fas fa-user-astronaut"></i></a>
                  </td>
                  <td title="Warp Gate">
                    <a href="javascript:;" @click="sort(['warpGate'])"><i class="fas fa-dungeon"></i></a>
                  </td>
                  <td title="Economy Infrastructure" class="text-end">
                    <a href="javascript:;" @click="sort(['infrastructure','economy'])"><i class="fas fa-money-bill-wave me-2"></i></a>
                  </td>
                  <td title="Industry Infrastructure" class="text-end">
                    <a href="javascript:;" @click="sort(['infrastructure','industry'])"><i class="fas fa-tools me-2"></i></a>
                  </td>
                  <td title="Science Infrastructure" class="text-end">
                    <a href="javascript:;" @click="sort(['infrastructure','science'])"><i class="fas fa-flask"></i></a>
                  </td>
                  <td title="Next Economy Infrastructure Cost" class="text-end" v-if="isEconomyEnabled"><a href="javascript:;" @click="sort(['upgradeCosts','economy'])">$E</a></td>
                  <td title="Next Industry Infrastructure Cost" class="text-end" v-if="isIndustryEnabled"><a href="javascript:;" @click="sort(['upgradeCosts','industry'])">$I</a></td>
                  <td title="Next Science Infrastructure Cost" class="text-end" v-if="isScienceEnabled"><a href="javascript:;" @click="sort(['upgradeCosts','science'])">$S</a></td>
              </tr>
          </thead>
          <tbody>
              <star-row v-for="star in sortedFilteredTableData"
                        v-bind:key="star._id"
                        :star="star"
                        :allowUpgrades="allowUpgrades"
                        @onOpenStarDetailRequested="onOpenStarDetailRequested"/>
          </tbody>
      </table>
    </div>
  </div>

  <p v-if="!sortedFilteredTableData.length" class="text-center mt-2 mb-2">No stars to display.</p>
</div>
</template>

<script>
import GameHelper from '../../../../services/gameHelper'
import GridHelper from '../../../../services/gridHelper'
import SortInfo from '../../../../services/data/sortInfo'
import StarRowVue from './StarRow.vue'

export default {
  components: {
    'star-row': StarRowVue
  },
  data: function () {
    let defaultSortInfo = new SortInfo([['name']], true);

    return {
      showAll: false,
      allowUpgrades: true,
      defaultSortInfo: defaultSortInfo,
      sortInfo: new SortInfo(defaultSortInfo.propertyPaths, defaultSortInfo.sortAscending),
      sortInfoKey: 'galaxy_stars_sortInfo',
      searchFilter: ''
    }
  },
  mounted () {
    this.showAll = this.userPlayer == null;
    this.sortInfo = SortInfo.fromJSON(localStorage.getItem(this.sortInfoKey), this.defaultSortInfo);
    this.allowUpgrades = this.$store.state.settings.interface.galaxyScreenUpgrades === 'enabled' && !this.isGameFinished;
  },
  destroyed () {
    localStorage.setItem(this.sortInfoKey, JSON.stringify(this.sortInfo));
  },
  methods: {
    toggleShowAll () {
      this.showAll = !this.showAll;
    },
    sort (...propertyPaths) {
      this.sortInfo.swapSort(propertyPaths);
    },
    onOpenStarDetailRequested (e) {
      this.$emit('onOpenStarDetailRequested', e)
    },
    // TODO: Move this method to a base class of the table vue components (eg StarTable.vue) once we move to Vue 3 and can use Typescript.
    missingPropertyFallbackFunc(obj, key) {
      switch (key) {
        case 'ownedByPlayer':
          return this.playersMap.get(obj.ownedByPlayerId);
        default:
          return null;
      }
    }
  },
  computed: {
    userPlayer () {
      return GameHelper.getUserPlayer(this.$store.state.game)
    },
    playersMap() {
      return new Map(this.$store.state.game.galaxy.players.map(p => [p._id, p]));
    },
    tableData () {
      return this.$store.state.game.galaxy.stars;
    },
    filteredTableData() {
      let tableData = this.tableData;

      let isSearchFilterMatch = s => s.name.toLowerCase().includes(this.searchFilter.toLowerCase());

      if (!this.showAll && this.userPlayer != null) {
        tableData = tableData.filter(s => s.ownedByPlayerId === this.userPlayer._id && isSearchFilterMatch(s));
      }
      else {
        tableData = tableData.filter(isSearchFilterMatch);
      }

      return tableData;
    },
    sortedFilteredTableData() {
      return GridHelper.dynamicSort(this.filteredTableData, this.sortInfo, this.missingPropertyFallbackFunc);
    },
    isEconomyEnabled: function () {
      return this.$store.state.game.settings.player.developmentCost.economy !== 'none'
    },
    isIndustryEnabled: function () {
      return this.$store.state.game.settings.player.developmentCost.industry !== 'none'
    },
    isScienceEnabled: function () {
      return this.$store.state.game.settings.player.developmentCost.science !== 'none'
    },
    isGameFinished: function () {
      return GameHelper.isGameFinished(this.$store.state.game)
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
