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
                    <a href="javascript:;" @click="sort(['specialist', 'name'], ['name'])"><i class="fas fa-user-astronaut"></i></a>
                  </td>
                  <td title="Warp Gate">
                    <a href="javascript:;" @click="sort(['warpGate'], ['name'])"><i class="fas fa-dungeon"></i></a>
                  </td>
                  <td title="Binary Star">
                    <a href="javascript:;" @click="sort(['isBinaryStar'], ['name'])"><star-icon :isBinaryStar="true"></star-icon></a>
                  </td>
                  <td title="Nebula">
                    <a href="javascript:;" @click="sort(['isNebula'], ['name'])"><star-icon :isNebula="true"></star-icon></a>
                  </td>
                  <td title="Black Hole">
                    <a href="javascript:;" @click="sort(['isBlackHole'], ['name'])"><star-icon :isBlackHole="true"></star-icon></a>
                  </td>
                  <td title="Asteroid Field">
                    <a href="javascript:;" @click="sort(['isAsteroidField'], ['name'])"><star-icon :isAsteroidField="true"></star-icon></a>
                  </td>
                  <td title="Pulsar">
                    <a href="javascript:;" @click="sort(['isPulsar'], ['name'])"><star-icon :isPulsar="true"></star-icon></a>
                  </td>
                  <td title="Wormhole" style="text-align: center;">
                    <a href="javascript:;" @click="sort(['isWormHole'], ['wormHolePairStar', 'name'])"><star-icon :isWormHole="true"></star-icon></a>
                  </td>
                  <td></td>
                  <td title="Wormhole destination owner"><a href="javascript:;" @click="sort(['wormHolePairStar', 'ownedByPlayer','alias'], ['wormHolePairStar', 'ownedByPlayerId'], ['wormHolePairStar', 'name'])"><i class="fas fa-user"></i></a></td>
                <!--TODO: Fix time machine bar on tick.-->
              </tr>
          </thead>
          <tbody>
              <star-types-row v-for="star in sortedFilteredTableData"
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
import StarIconVue from '../star/StarIcon.vue'
import StarTypesRowVue from './StarTypesRow.vue'

export default {
  components: {
    'star-icon': StarIconVue,
    'star-types-row': StarTypesRowVue
  },
  data: function () {
    let defaultSortInfo = new SortInfo([['name']], true);

    return {
      showAll: false,
      allowUpgrades: true,
      defaultSortInfo: defaultSortInfo,
      sortInfo: new SortInfo(defaultSortInfo.propertyPaths, defaultSortInfo.sortAscending),
      sortInfoKey: 'galaxy_startypes_sortInfo',
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
      return this.$store.state.game.galaxy.stars.map(s => {

        let ns = Object.assign({}, s);

        ns.isWormHole = ns.wormHoleToStarId != null;
        ns.wormHolePairStar = ns.wormHoleToStarId != null ? GameHelper.getStarById(this.$store.state.game, ns.wormHoleToStarId) : null;

        return ns;
      });
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
    }
  }
}
</script>

<style scoped>
td {
  padding: 12px 6px !important;
}
</style>
