<template>
<div class="container">
    <div class="mb-2">
        <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">Show All Carriers</button>
    </div>

    <table class="table table-striped table-hover table-bordered">
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
            <carrier-row v-for="carrier in getTableData()" v-bind:key="carrier._id" :data="carrier" />
        </tbody>
    </table>
</div>
</template>

<script>
import CarrierRowVue from './CarrierRow'

export default {
  components: {
      'carrier-row': CarrierRowVue
  },
  props: {
    game: Object
  },
  data: function() {
      return {
        carriers: [
            {
                _id: 1,
                playerId: 1,
                name: 'Test Carrier',
                ships: 100,
                waypoints: 3,
                waypointsLooped: false,
                eta: '5h',
                totalEta: '10h'
            },
            {
                _id: 2,
                playerId: 1,
                name: 'Test Carrier 2',
                ships: 5,
                waypoints: 1,
                waypointsLooped: true,
                eta: '1d 7h',
                totalEta: '2d'
            },
            {
                _id: 3,
                playerId: 2,
                name: 'Test Carrier 3',
                ships: 420,
                eta: '5h',
            }
        ],
        showAll: false
      }
  },
  methods: {
      toggleShowAll() {
          this.showAll = !this.showAll;
      },
      getTableData() {
          if (this.showAll) {
              return this.carriers;
          } else {
              return this.carriers.filter(x => x.playerId === 1);
          }
      }
  }
}
</script>

<style scoped>
</style>