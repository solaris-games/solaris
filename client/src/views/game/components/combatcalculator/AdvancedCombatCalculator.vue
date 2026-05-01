<template>
  <div class="p-2 row">
    <calculator-combat-group @onGroupRemove="onGroupRemoved" v-for="(group, index) in groups" :key="index" v-model="groups[index]" :validation-errors="getErrors(group)" />
  </div>
  <div class="p-2 row" v-if="result">
    <calculator-combat-result :result="result" />
  </div>
  <div class="p-2 row">
    <div class="col-6">
      <button class="btn btn-success" @click="addGroup">Add Group</button>
    </div>
    <div class="col-6">
      <button class="btn btn-primary" :disabled="hasErrors" @click="calculate">Calculate</button>
    </div>
  </div>
  <div class="p-2 row">
    <p v-for="err of errors" class="text-danger">{{ err }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue';
import CalculatorCombatGroup from "@/views/game/components/combatcalculator/CalculatorCombatGroup.vue";
import type {
  CombatBaseCarrier,
  CombatBasePlayer,
  CombatBaseStar,
  CombatGroup,
  DetailedCombatResult
} from "@solaris/common";
import CalculatorCombatResult from "@/views/game/components/combatcalculator/CalculatorCombatResult.vue";
import {useGameStore} from "@/stores/game";
import {useGameServices} from "@/util/gameServices";

const emptyGroup = (): CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>> => ({
  originalShips: 0,
  ships: 0,
  isDefender: false,
  attackAgainst: new Map(),
  players: [],
  carriers: [],
  star: undefined,
  shipsKilled: 0,
});

type CG = CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>;

const store = useGameStore();
const serviceProvider = useGameServices();

const groups = ref<CG[]>([]);
const result = ref<DetailedCombatResult<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>> | null>(null);

const errors = computed(() => {
  if (groups.value.length < 2) {
    return ["Need at least 2 groups to calculate combat."];
  }

  return [];
});

const hasErrors = computed(() => errors.value.length > 0);

const onGroupRemoved = (gr: CG) => {
  groups.value.splice(groups.value.indexOf(gr), 1);
}

const addGroup = () => {
  groups.value.push(emptyGroup());
};

const calculate = () => {
  result.value = serviceProvider.combatService.computeGroups(groups.value);
};

const getErrors = (group: CG) => {
  return [];
};
</script>
<style scoped>

</style>
