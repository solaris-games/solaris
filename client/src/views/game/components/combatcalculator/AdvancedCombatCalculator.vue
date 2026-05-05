<template>
  <div class="p-2 row">
    <calculator-combat-group @onGroupRemove="onGroupRemoved" v-for="(group, index) in groups" :key="index" v-model="groups[index]" :index="index" :groups="groups" :validation-errors="getErrors(group)" />
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
import {type CCGroup, makeCombatGroups} from "@/views/game/components/combatcalculator/types";
import type {Game} from "@/types/game";

const store = useGameStore();
const serviceProvider = useGameServices();

const game = computed<Game>(() => store.game!);

const groups = ref<CCGroup[]>([]);
const result = ref<DetailedCombatResult<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>> | null>(null);

const errors = computed(() => {
  if (groups.value.length < 2) {
    return ["Need at least 2 groups to calculate combat."];
  }

  return [];
});

const actualCombatGroups = computed<CombatGroup<string, CombatBasePlayer<string>, CombatBaseStar<string>, CombatBaseCarrier<string>>[]>(() => {
  return makeCombatGroups(game.value, groups.value, serviceProvider.combatService);
});

const hasErrors = computed(() => errors.value.length > 0);

const onGroupRemoved = (gr: CCGroup) => {
  groups.value.splice(groups.value.indexOf(gr), 1);
}

const addGroup = () => {
  groups.value.push({
    name: `Group ${groups.value.length + 1}`,
    star: undefined,
    carriers: [],
    weapons: { kind: 'level', level: 1 },
  });
};

const getErrors = (group: CCGroup) => {
  return [];
};

const calculate = () => {
  console.log(groups.value);

  result.value = serviceProvider.combatService.computeGroups(actualCombatGroups.value);
};
</script>
<style scoped>

</style>
