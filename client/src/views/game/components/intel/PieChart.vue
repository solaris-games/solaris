<template>
  <pie :data="chartData" :options="options" />
</template>

<script setup lang="ts">
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale, ArcElement,
  type ChartOptions,
} from 'chart.js'
import type {DataCollection} from "@/views/game/components/intel/types.ts";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, RadialLinearScale, ArcElement)


const props = defineProps<{
  options: ChartOptions<"pie">,
  chartData: DataCollection,
}>();
</script>

<style scoped>

</style>
