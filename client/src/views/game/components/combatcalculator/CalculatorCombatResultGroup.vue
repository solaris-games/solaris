<template>
  <div class="cg-result-group p-2">
    <p>Group {{ groupIndex }}</p>
    <combat-group-attack :attack-against="group.attackAgainst" />
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Object</th>
          <th>Before</th>
          <th>Lost</th>
          <th>After</th>
        </tr>
      </thead>
      <tbody>
        <calculator-combat-result-object v-if="group.star" :object="group.star">
          <span><i class="fas fa-star me-1"></i></span>
          <span v-if="group.star.star.specialistId">{{
            getSpecialistName(group.star.star.specialistId, "star")
          }}</span>
        </calculator-combat-result-object>
        <calculator-combat-result-object
          v-for="carrier of group.carriers"
          :object="carrier"
        >
          <span><i class="fas fa-rocket me-1"></i></span>
          <span v-if="carrier.carrier.specialistId">{{
            getSpecialistName(carrier.carrier.specialistId, "carrier")
          }}</span>
        </calculator-combat-result-object>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import type {
  CombatBaseCarrier,
  CombatBasePlayer,
  CombatBaseStar,
  DetailedCombatResultGroup,
} from "@solaris/common";
import CombatGroupAttack from "@/views/game/components/eventLog/events/combat/CombatGroupAttack.vue";
import CalculatorCombatResultObject from "@/views/game/components/combatcalculator/CalculatorCombatResultObject.vue";
import { useGameStore } from "@/stores/game.ts";

type CGr = DetailedCombatResultGroup<
  string,
  CombatBasePlayer<string>,
  CombatBaseStar<string>,
  CombatBaseCarrier<string>
>;

const props = defineProps<{
  group: CGr;
  groupIndex: number;
  groups: CGr[];
}>();

const store = useGameStore();

const getSpecialistName = (id: number, kind: "star" | "carrier") =>
  store.getSpecialist(id, kind).name;
</script>
<style scoped>
.cg-result-group {
  border: 1px white solid;
  border-radius: 4px;
}
</style>
