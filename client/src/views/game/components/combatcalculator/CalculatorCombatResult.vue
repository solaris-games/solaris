<template>
<div class="cg-result">
  <calculator-combat-result-group v-for="(attackGroup, index) in result.groups" :key="index" :groups="result.groups" :group="attackGroup" :groupIndex="index"></calculator-combat-result-group>

  <p v-if="winner && winnerName">{{ winnerName }} wins the battle!</p>
</div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type {CombatBaseCarrier, CombatBasePlayer, CombatBaseStar, DetailedCombatResult} from "@solaris/common";
import CalculatorCombatResultGroup from "@/views/game/components/combatcalculator/CalculatorCombatResultGroup.vue";
import {useGameServices} from "@/util/gameServices";

const props = defineProps<{
  result: DetailedCombatResult<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>,
}>();

const serviceProvider = useGameServices();

const winner = computed(() => serviceProvider.combatService.getWinnerDetailed(props.result));
const winnerName = computed(() => winner.value && `Group ${props.result.groups.indexOf(winner.value)}`);
</script>
<style scoped>

</style>
