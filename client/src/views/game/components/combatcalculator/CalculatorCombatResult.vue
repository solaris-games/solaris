<template>
  <div class="cg-result">
    <div class="cg-result-objects">
      <calculator-combat-result-group
        v-for="(attackGroup, index) in result.groups"
        :key="index"
        :groups="result.groups"
        :group="attackGroup"
        :groupIndex="index"
      ></calculator-combat-result-group>
    </div>

    <p class="text-success m-0" v-if="winner && winnerName">
      {{ winnerName }} wins the battle!
    </p>
    <p v-for="needed of neededForOthers" class="text-warning m-0">
      Group {{ result.groups.indexOf(needed.group) }} needed
      {{ needed.needed }} ships to win.
    </p>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type {
  CombatBaseCarrier,
  CombatBasePlayer,
  CombatBaseStar,
  DetailedCombatResult,
} from "@solaris/common";
import CalculatorCombatResultGroup from "@/views/game/components/combatcalculator/CalculatorCombatResultGroup.vue";
import { useGameServices } from "@/util/gameServices";

const props = defineProps<{
  result: DetailedCombatResult<
    string,
    CombatBasePlayer<string>,
    CombatBaseStar<string>,
    CombatBaseCarrier<string>
  >;
}>();

const serviceProvider = useGameServices();

const winner = computed(() =>
  serviceProvider.combatService.getWinnerDetailed(props.result),
);
const winnerName = computed(
  () => winner.value && `Group ${props.result.groups.indexOf(winner.value)}`,
);

const neededForOthers = computed(() => {
  return props.result.groups.flatMap((g) => {
    if (g !== winner.value) {
      const needed = serviceProvider.combatService.estimateNeeded(
        props.result,
        g,
        g.star ? 'eliminateOtherGroups' : 'greaterThanZeroShips',
      );

      return [
        {
          group: g,
          needed,
        },
      ];
    }

    return [];
  });
});
</script>
<style scoped>
.cg-result-objects {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
