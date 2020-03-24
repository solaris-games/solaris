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
            <star-row v-for="star in getTableData()" v-bind:key="star._id" :data="star" />
        </tbody>
    </table>
</div>
</template>

<script>
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
      stars: [
        {
          _id: 1,
          playerId: 1,
          name: 'Test Star',
          economy: 1,
          industry: 2,
          science: 0,
          economyCost: 45,
          industryCost: 79,
          scienceCost: 153
        },
        {
          _id: 2,
          playerId: 1,
          name: 'Test Star 2',
          economy: 6,
          industry: 3,
          science: 2,
          economyCost: 66,
          industryCost: 234,
          scienceCost: 400
        },
        {
          _id: 3,
          playerId: 2,
          name: 'Test Star 3',
          economy: 5,
          industry: 5,
          science: 3
          // TODO: Are these known values when in scanning range?
          // economyCost: 45,
          // industryCost: 79,
          // scienceCost: 153
        },
        {
          _id: 4,
          playerId: 2,
          name: 'Test Star 3',
          economy: '?',
          industry: '?',
          science: '?'
          // TODO: Are these known values when in scanning range?
          // economyCost: 45,
          // industryCost: 79,
          // scienceCost: 153
        }
      ],
      showAll: false
    }
  },
  methods: {
    toggleShowAll () {
      this.showAll = !this.showAll
    },
    getTableData () {
      if (this.showAll) {
        return this.stars
      } else {
        return this.stars.filter(x => x.playerId === 1)
      }
    }
  }
}
</script>

<style scoped>
</style>
