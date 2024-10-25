<template>
  <polar-area :data="chartData" :options="options" />
</template>

<script>
import { PolarArea } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: "PolarAreaChart",
  components: {
    PolarArea,
  },
  props: {
    options: Object,
    chartData: Object,
  }
}
</script>

<style scoped>

</style>
