<template>
  <pie :chart-data="chartData" :options="options" />
</template>

<script>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: "PieChart",
  components: {
    Pie,
  },
  props: {
    options: Object,
    chartData: Object,
  }
}
</script>

<style scoped>

</style>
