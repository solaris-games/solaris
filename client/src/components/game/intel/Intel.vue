<template>
<div class="bg-secondary pb-2">
    <div class="container">
        <h3 class="pt-2">Intel</h3>

        <select class="form-control">
            <option>Total Stars</option>
        </select>
    </div>

    <div class="mb-2 mt-2 ml-1 mr-1">
        <line-chart :chart-data="datacollection" :options="dataoptions" />
    </div>

    <div class="container">
        <div class="row">
            <div class="col-4">
                <button class="btn btn-primary">All</button>
                <button class="btn btn-primary ml-1 mr-3">None</button>
            </div>

            <div class="col">
                <button class="btn btn-primary mr-1 mb-1"><i class="far fa-circle"></i></button>
                <button class="btn btn-primary mr-1 mb-1"><i class="far fa-circle"></i></button>
            </div>
        </div>
    </div>
</div>
</template>

<script>
import LineChart from './LineChart.js'

export default {
  components: {
    'line-chart': LineChart
  },
  props: {
    game: Object
  },
  data() {
      return {
          datacollection: null,
          dataoptions: {
              legend: {
                  display: false
              }
          }
      }
  },
  mounted () {
      this.fillData()
    },
  methods: {
      fillData() {
        this.datacollection = {
            labels: [this.getRandomInt(), this.getRandomInt()],
            datasets: [
                {
                    label: 'Data One',
                    borderColor: '#0000FF',
                    fill: false,
                    data: [this.getRandomInt(), this.getRandomInt()]
                }, {
                    label: 'Data One',
                    borderColor: '#DF5F00',
                    fill: false,
                    data: [this.getRandomInt(), this.getRandomInt()]
                }
            ]
        }
      },
      getRandomInt() {
          return Math.floor(Math.random() * (50 - 5 + 1)) + 5
      }
  }
}
</script>

<style scoped>
</style>