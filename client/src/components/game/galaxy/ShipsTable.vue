<template>
<div class="container">
    <div class="mb-2">
        <button class="btn" :class="{ 'btn-danger': !showAll, 'btn-success': showAll }" @click="toggleShowAll">Show All Ships</button>
    </div>

    <table class="table table-striped table-hover table-bordered">
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
            <ship-row v-for="ship in getTableData()" v-bind:key="ship._id" :data="ship" />
        </tbody>
    </table>
</div>
</template>

<script>
import ShipRowVue from './ShipRow'

export default {
  components: {
      'ship-row': ShipRowVue
  },
  props: {
    game: Object
  },
  data: function() {
      return {
        ships: [
            {
                _id: 1,
                playerId: 1,
                name: 'Test Ship',
                ships: 100,
                type: 0 // 0 = star, 1 = carrier
            },
            {
                _id: 2,
                playerId: 1,
                name: 'Test Ship 2',
                ships: 30,
                type: 1
            },
            {
                _id: 1,
                playerId: 2,
                name: 'Test Ship 3',
                ships: 420,
                type: 0
            },
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
              return this.ships;
          } else {
              return this.ships.filter(x => x.playerId === 1);
          }
      }
  }
}
</script>

<style scoped>
</style>