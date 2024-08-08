<template>
  <line :chart-data="chartData" :options="options" />
</template>

<script>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: "LineChart",
  components: {
    Line,
  },
  props: {
    options: Object,
    chartData: Object,
  }
}
</script>

<style scoped>

</style>
