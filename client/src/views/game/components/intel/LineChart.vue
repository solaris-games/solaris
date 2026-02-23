<template>
  <Line :data="chartData" :options="options" />
</template>

<script setup lang="ts">
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
  PointElement,
  LineElement,
  type ChartOptions,
} from 'chart.js'
import type {DataCollection} from "@/views/game/components/intel/types.ts";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, LineController, PointElement, LineElement)

const props = defineProps<{
  options: ChartOptions<"line">,
  chartData: DataCollection,
}>();
</script>

<style scoped>

</style>
