<template>
  <polar-area :data="chartData" :options="options" />
</template>

<script setup lang="ts">
import { PolarArea } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, type ChartOptions } from 'chart.js'
import type {DataCollection} from "@/views/game/components/intel/types.ts";

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
  options: ChartOptions<"polarArea">,
  chartData: DataCollection,
}>();
</script>

<style scoped>

</style>
