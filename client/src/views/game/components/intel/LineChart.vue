<template>
  <Line :data="chartData" :options="options" />
</template>

<script>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  LineController,
  PointElement, LineElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineController, PointElement, LineElement)

export default {
  name: "LineChart",
  components: {
    Line,
  },
  props: {
    options: Object,
    chartData: Object,
  },
  mounted() {
    console.warn(this.chartData);
  }
}
</script>

<style scoped>

</style>
