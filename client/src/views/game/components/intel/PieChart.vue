<template>
  <pie :data="chartData" :options="options" />
</template>

<script>
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale, ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, RadialLinearScale, ArcElement)

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
