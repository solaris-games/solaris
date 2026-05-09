<template>
  <div class="cg-result-group p-1">
    <p>Group {{groupIndex}}</p>
    <combat-group-attack :attack-against="group.attackAgainst" />
  </div>
</template>
<script setup lang="ts">
import type {CombatBaseCarrier, CombatBasePlayer, CombatBaseStar, DetailedCombatResultGroup} from "@solaris/common";
import CombatGroupAttack from "@/views/game/components/eventLog/events/combat/CombatGroupAttack.vue";

type CGr = DetailedCombatResultGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>;

const props = defineProps<{
  group: CGr,
  groupIndex: number,
  groups: CGr[],
}>();
</script>
<style scoped>
.cg-result-group {
  border: 1px white solid;
  border-radius: 4px;
}
</style>
